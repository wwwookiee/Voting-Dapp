"use client"

// REACT
import { useState } from 'react'

// CHAKRA-UI
import { Flex, Heading, Input, Button, useToast, Text } from '@chakra-ui/react'

// WAGMI
import { prepareWriteContract, writeContract, readContract } from '@wagmi/core'
import { useAccount } from 'wagmi'

// CONTRACT
import Contract from '../../public/abi/Voting.json'


const VoteForProposal = ({getEvents}) => {

    /* Contract Address */
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS

    /* `toast` init */
    const toast = useToast()

    /* Reprendre les infos du wallet connecté */
    const { address } = useAccount()

  const [proposal, setProposal] = useState(null)
  const [voteProposal, setVoteProposal] = useState(null)
  const [proposalID, setProposalID] = useState(null)

  const setVote = async() => {
    try {
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: 'setVote',
        account: address,
        args : [voteProposal]
      });
      await writeContract(request)
      getEvents()
      toast({
        title: 'You have voted!',
        description: 'Your rock, you\'r vote goes for prosal ID : ' + voteProposal,
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


  const getOneProposal = async() => {
    try {
      const data = await readContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: 'getOneProposal',
        account: address ,
        args : [proposalID]
      });
      setProposal(data.description)
    }
    catch(err) {
      console.log(err)
    }
  }

  return (
    <Flex direction="column" mt="1rem" p="1rem" width="100%" border='0px' borderColor='gray.200' borderRadius="0.5rem">
      <Heading as='h3' size='xl'>Vote for a Proposal</Heading>
      <Text mt="1rem" fontStyle="italic">Submit your vote. Remember that only one vote is allowed per voter.</Text>
      <Flex mt="1rem" mb="2rem">
        <Input mr="0.5rem" placeholder="submit a proposal" onChange={e => setVoteProposal(e.target.value)}/>
        <Button mr="0.5rem" colorScheme='whatsapp' onClick={() => setVote()}>submit</Button>
      </Flex>
      <hr />
      <Text mt="1rem" fontStyle="italic">You can get a proposal's detail by entering his ID.</Text>
      <Flex mt="1rem" mb="2rem">
        <Input mr="0.5rem" placeholder="proposal's ID" onChange={e => setProposalID(e.target.value)}/>
        <Button mr="0.5rem" colorScheme='whatsapp' onClick={() => getOneProposal()}>submit</Button>
      </Flex>
      {proposal && <Text>Proposal's detail for {proposalID} : {proposal}</Text> }
    </Flex>
  )
}

export default VoteForProposal

