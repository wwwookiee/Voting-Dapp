// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
 * @author      wwwookiee
 * @title       Voting contract
 * @notice      this SC can be used to vote for proposals. Equality on vote count is not handled.
 * @inheritdoc  Ownable
 */
import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {

    /**
     * @notice     Winning proposal ID
     */
    uint winningProposalID;

    /**
     * @notice     Voter struct
     * @param      isRegistered      Voter is registered
     * @param      hasVoted          Voter has voted
     * @param      votedProposalId   Voter voted for proposal id
     */
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    /**
     * @notice    Proposal struct
     * @param     description   Proposal description
     * @param     voteCount     Proposal vote count
     */
    struct Proposal {
        string description;
        uint voteCount;
    }

    /**
     * @notice   Workflow status enum
     * @param    RegisteringVoters              Registering voters
     * @param    ProposalsRegistrationStarted   Proposals registration started
     * @param    ProposalsRegistrationEnded     Proposals registration ended
     * @param    VotingSessionStarted           Voting session started
     * @param    VotingSessionEnded             Voting session ended
     * @param    VotesTallied                   Votes tallied (winning proposal found) / end of the workflow
     */
    enum  WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    // @notice Workflow status
    WorkflowStatus public workflowStatus;
    // @notice Proposals array
    Proposal[] proposalsArray;
    // @notice Voters mapping
    mapping (address => Voter) voters;

    /**
     * @notice Voter Registered event
     * @param voterAddress Address of a registered voter
     */
    event VoterRegistered(address voterAddress);
    /**
     * @notice Workflow status change event
     * @param previousStatus    Previous workflow status
     * @param newStatus         New workflow status
     */
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    /**
     * @notice Proposal registered event
     * @param proposalId    Id of the registered proposal
     */
    event ProposalRegistered(uint proposalId);
    /**
     * @notice Voted event
     * @param voter         Address of the voter
     * @param proposalId    Id of the proposal voted for
     */
    event Voted (address voter, uint proposalId);

    /**
     * @notice Only voters modifier
     * @dev    Revert if the sender is not a registered voter
     */
    modifier onlyVoters() {
        require(voters[msg.sender].isRegistered, "You're not a voter");
        _;
    }

    // ::::::::::::: GETTERS ::::::::::::: //

    /**
     * @notice Get a voter's information
     * @param _addr Address of the voter
     * @dev    onyVoters modifier: Revert if the sender is not a registered voter
     * @return Voter struct
     */
    function getVoter(address _addr) external onlyVoters view returns (Voter memory) {
        return voters[_addr];
    }

    /**
     * @notice Get a proposal's information
     * @param _id Id of the proposal
     * @dev    onyVoters modifier: Revert if the sender is not a registered voter
     * @return Proposal struct
     */
    function getOneProposal(uint _id) external onlyVoters view returns (Proposal memory) {
        return proposalsArray[_id];
    }

    /**
     * @notice Get the winning proposals
     * @dev    onyVoters modifier: Revert if the sender is not a registered voter
     * @return Proposal struct
     */
    function getWinningProposal() external onlyVoters view returns (Proposal memory) {
        return proposalsArray[winningProposalID];
    }


    // ::::::::::::: REGISTRATION ::::::::::::: //
    /**
     * @notice Registration of a voter
     * @param _addr Address of the voter
     * @dev onyVoters modifier: Revert if the sender is not a registered voter
     * first require: Revert if the workflow status is not RegisteringVoters
     * second require: Revert if the voter is already registered
     */
    function addVoter(address _addr) external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Voters registration is not open yet');
        require(voters[_addr].isRegistered != true, 'Already registered');

        voters[_addr].isRegistered = true;
        emit VoterRegistered(_addr);
    }


    // ::::::::::::: PROPOSAL ::::::::::::: //

    /**
     * @notice Add a proposal
     * @param _desc Description of the proposal
     * @dev onyVoters modifier: Revert if the sender is not a registered voter
     * first require: Revert if the workflow status is not ProposalsRegistrationStarted
     * second require: Revert if the proposal description is empty
     */
    function addProposal(string calldata _desc) external onlyVoters {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, 'Proposals are not allowed yet');
        require(keccak256(abi.encode(_desc)) != keccak256(abi.encode("")), 'Vous ne pouvez pas ne rien proposer'); // facultatif

        Proposal memory proposal;
        proposal.description = _desc;
        proposalsArray.push(proposal);
        emit ProposalRegistered(proposalsArray.length-1);
    }

    // ::::::::::::: VOTE ::::::::::::: //

    /**
     * @notice Vote for a proposal and store a temporary winning proposal
     * @param _id Id of the proposal
     * @dev onyVoters modifier: Revert if the sender is not a registered voter
     * first require: Revert if the workflow status is not VotingSessionStarted
     * second require: Revert if the voter has already voted
     * third require: Revert if the proposal id is not valid
     */
    function setVote( uint _id) external onlyVoters {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, 'Voting session havent started yet');
        require(voters[msg.sender].hasVoted != true, 'You have already voted');
        require(_id < proposalsArray.length, 'Proposal not found'); // pas obligé, et pas besoin du >0 car uint

        voters[msg.sender].votedProposalId = _id;
        voters[msg.sender].hasVoted = true;
        proposalsArray[_id].voteCount++;

        if (proposalsArray[_id].voteCount > proposalsArray[winningProposalID].voteCount) {
            winningProposalID = _id;
        }

        emit Voted(msg.sender, _id);
    }

    // ::::::::::::: STATE ::::::::::::: //

    /**
     * @notice Change the workflow status to ProposalsRegistrationStarted
     * @dev onlyOwner modifier: Revert if the sender is not the owner
     * first require: Revert if the workflow status is not RegisteringVoters
     */
    function startProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Registering proposals cant be started now');
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;

        Proposal memory proposal;
        proposal.description = "GENESIS";
        proposalsArray.push(proposal);
        
        emit ProposalRegistered(proposalsArray.length-1);
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }
    /**
     * @notice Change the workflow status to ProposalsRegistrationEnded
     * @dev onlyOwner modifier: Revert if the sender is not the owner
     * first require: Revert if the workflow status is not ProposalsRegistrationStarted
     */
    function endProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, 'Registering proposals havent started yet');
        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }
    /**
     * @notice Change the workflow status to VotingSessionStarted
     * @dev onlyOwner modifier: Revert if the sender is not the owner
     * first require: Revert if the workflow status is not ProposalsRegistrationEnded
     */
    function startVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationEnded, 'Registering proposals phase is not finished');
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }
    /**
     * @notice Change the workflow status to VotingSessionEnded
     * @dev onlyOwner modifier: Revert if the sender is not the owner
     * first require: Revert if the workflow status is not VotingSessionStarted
     */
    function endVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, 'Voting session havent started yet');
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }

    /**
     * @notice Change the workflow status to VotesTallied
     * @dev onlyOwner modifier: Revert if the sender is not the owner
     * first require: Revert if the workflow status is not VotingSessionEnded
     */
   function tallyVotes() external onlyOwner {
       require(workflowStatus == WorkflowStatus.VotingSessionEnded, "Current status is not voting session ended");

       workflowStatus = WorkflowStatus.VotesTallied;
       emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    }
}