"use client"

// REACT
import { useState } from 'react'

// CHAKRA-UI
import { Heading, Flex, Text, Input, Button, useToast } from '@chakra-ui/react'

// CONTRACT
import Contract from '../../public/abi/Voting.json'

// WAGMI
import { prepareWriteContract, writeContract, readContract } from '@wagmi/core'
import { useAccount } from 'wagmi'

const Admin = ({workflowStatusHandler, workflowStatus, getEvents}) => {

  /* Contract Address */
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS

  /* `toast` init */
  const toast = useToast()

  // Reprendre les infos du wallet connecté
  const { address } = useAccount()

   // STATES
   const [voterAddress, setVoterAddress] = useState(null)

  const changeVotingPhase = async(functionName) => {
    try {
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: functionName,
        account: address
      });
      await writeContract(request)
      workflowStatusHandler()

      toast({
        title: 'WorkflowStatus chanded!',
        description: 'New WorkflowStatus is : ' + workflowStatus,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    }
    catch(err) {
      console.log(err)
      toast({
        title: 'Error!',
        description: err.details,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const addVoter = async() => {
    try {
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: 'addVoter',
        account: address,
        args : [voterAddress]
      });
      await writeContract(request)
      getEvents()
      toast({
        title: 'Voter added!',
        description: 'address : ' + voterAddress,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    }
    catch(err) {
      console.log(err)
      toast({
        title: 'Error!',
        description: err.details || 'An error occured.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
    
  }

  return (
    <Flex direction="column" mt="1rem" p="1rem" width="100%" border='2px' borderColor='red.200' borderRadius="0.5rem">
        <Heading as='h3' size='xl'>Admin panel</Heading>
        <Flex mt="1rem" mb="2rem">
            { workflowStatus === "RegisteringVoters" && <Button mr="0.5rem" colorScheme='whatsapp' onClick={() => changeVotingPhase("startProposalsRegistering")}>startProposalsRegistering</Button>}
            { workflowStatus === "ProposalsRegistrationStarted" && <Button mr="0.5rem" colorScheme='whatsapp' onClick={() => changeVotingPhase("endProposalsRegistering")}>endProposalsRegistering</Button>}
            { workflowStatus === "ProposalsRegistrationEnded" && <Button mr="0.5rem" colorScheme='whatsapp' onClick={() => changeVotingPhase("startVotingSession")}>VotingSessionStarted</Button>}
            { workflowStatus === "VotingSessionStarted" && <Button mr="0.5rem" colorScheme='whatsapp' onClick={() => changeVotingPhase("endVotingSession")}>VotingSessionEnded</Button>}
            { workflowStatus === "VotingSessionEnded" && <Button mr="0.5rem" colorScheme='whatsapp' onClick={() => changeVotingPhase("tallyVotes")}>VotesTallied</Button>}
            { workflowStatus === "VotesTallied" && <Text>Vote has ended : No more action are required by the admin</Text> }
        </Flex>
        { workflowStatus === "RegisteringVoters" ? (
         <>
          <hr/>
          <Text mt="2rem">Add voter</Text>
          <Flex mt="1rem">
              <Input mr="0.5rem" placeholder="Address" onChange={e => setVoterAddress(e.target.value)}/>
              <Button mr="0.5rem" colorScheme='whatsapp' onClick={() => addVoter()}>Add voter</Button>
          </Flex>
        </>
        ) : (null) }
    </Flex>
  )
}

export default Admin