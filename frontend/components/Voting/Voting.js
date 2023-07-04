"use client"

// REACT
import { useState, useEffect } from 'react'

// CHAKRA-UI
import { Flex, Text, useToast } from '@chakra-ui/react'

// VIEM (pour les events)
import { createPublicClient, http, parseAbiItem } from 'viem'
import { hardhat, goerli } from 'viem/chains'


// CONTRACT
import Contract from '../../public/abi/Voting.json'

// WAGMI
import { readContract } from '@wagmi/core'
import { useAccount } from 'wagmi'

// COMPONENTS
import AdminDashboard from '../AdminDashboard/AdminDashboard'
import Proposal from '../Proposal/Proposal'
import VoteForProposal from '../VoteForProposal/VoteForProposal'
import VotesTallied from '../VotesTallied/VotesTallied'
import SCEvents from '../SCEvents/SCEvents'

const Voting = () => {
/* Contract Address */
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS

/* `toast` init */
const toast = useToast()

// Reprendre les infos du wallet connecté
const { isConnected, address } = useAccount()

const workflowSatusToText = {
  0: 'RegisteringVoters',
  1: 'ProposalsRegistrationStarted',
  2: 'ProposalsRegistrationEnded',
  3: 'VotingSessionStarted',
  4: 'VotingSessionEnded',
  5: 'VotesTallied'
};

/* Creat client for viem events */
const client = createPublicClient({
  chain: goerli,
  transport : http()
})

/* useStates */
const [workflowStatus, setWorkflowStatus] = useState(null)
const [owner, setOwner] = useState(null)
const [voterAddressEvents, setVoterAddressEvents] = useState([])
const [proposalEvents, setProposalEvents] = useState([])
const [voteEvents, setVoteEvents] = useState([])

const workflowStatusHandler = async() => {
  try {
    const data = await readContract({
      address: contractAddress,
      abi: Contract.abi,
      functionName: 'workflowStatus',
      account: address
    });
    setWorkflowStatus(workflowSatusToText[data])
  }
  catch(err) {
    console.log(err)
  }
}

const getEvents = async() => {

  // Get all the events for VoterRegistered event
  const VotersLogs = await client.getLogs({
    address: '0x07EBB62Be83F68e3141abBe2F8eBF9ba8D43B582',
    event: parseAbiItem('event VoterRegistered(address voterAddress)'),
    fromBlock: 9285292n,
    toBlock: 'latest'
  })
  setVoterAddressEvents(VotersLogs.map(
    log => ({ voterAddress: log.args.voterAddress })
  ))

  // Get all the events for ProposalRegistered event
  const ProposalsLogs = await client.getLogs({
    address: '0x07EBB62Be83F68e3141abBe2F8eBF9ba8D43B582',
    event: parseAbiItem('event ProposalRegistered(uint proposalId)'),
    fromBlock: 9285292n,
    toBlock: 'latest'
  })

  const proposalEventsWithDescription = await Promise.all(
      ProposalsLogs.map(async (log) => ({
          proposalId: log.args.proposalId,
          description: await getOneProposal(log.args.proposalId)
      }))
  );

  setProposalEvents(proposalEventsWithDescription);

  // Get all the events for Voted event
  const voteLogs = await client.getLogs({
    address: '0x07EBB62Be83F68e3141abBe2F8eBF9ba8D43B582',
      event: parseAbiItem('event Voted(address voter, uint256 proposalId)'),
      fromBlock: 9285292n,
      toBlock: 'latest'
  });

  const voteEventsWithDescription = await Promise.all(
      voteLogs.map(async (log) => ({
          voter: log.args.voter,
          proposalId: log.args.proposalId,
          description: await getOneProposal(log.args.proposalId)
      }))
  );

  setVoteEvents(voteEventsWithDescription);
}

const getOneProposal = async(proposalId) => {
  try {
      const data = await readContract({
      address: contractAddress,
      abi: Contract.abi,
      functionName: 'getOneProposal',
      account: address ,
      args : [proposalId]
      });
      return data.description
  }
  catch(err) {
      console.log(err)
  }
}

const getOwner = async() => {
  try {
    const data = await readContract({
      address: contractAddress,
      abi: Contract.abi,
      functionName: 'owner',
      account: address
    });
    setOwner(data)
  }
  catch(err) {
    console.log(err)
  }
}

useEffect(() => {
  if(isConnected){
    getOwner()
    workflowStatusHandler()
    getEvents()
  }
}, [isConnected])

return (
  <>
  { isConnected ? (
    <>
    <Flex direction="column" p="1rem" width="100%" border='0px' backgroundColor='blue.600' borderRadius="0.5rem" color="white">
      <Text>You are connected with th following address : <strong>{address}</strong></Text>
      <Text mt="1rem">The current WorkflowStatus is : <strong>{workflowStatus}</strong></Text>
    </Flex>
    { owner === address && <AdminDashboard workflowStatusHandler={workflowStatusHandler} workflowStatus={workflowStatus} getEvents={getEvents}/>}
    { workflowStatus === "ProposalsRegistrationStarted" && <Proposal getEvents={getEvents}/> }
    { workflowStatus === "VotingSessionStarted" && <VoteForProposal getEvents={getEvents}/> }
    { workflowStatus === "VotesTallied" && <VotesTallied /> }
    <SCEvents workflowStatus={workflowStatus} getEvents={getEvents} voterAddressEvents={voterAddressEvents} proposalEvents={proposalEvents} voteEvents={voteEvents}/>
    </>
  ):(
    <Text align="center">Please connect your wallet</Text>
  )}
  </>
  )
  
}

export default Voting