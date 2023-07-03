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


const Proposal = ({getEvents}) => {

  /* Contract Address */
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS

  /* `toast` init */
  const toast = useToast()

  /* Reprendre les infos du wallet connecté */
  const { address } = useAccount()

  const [proposal, setProposal] = useState(null)

  const addProposal = async() => {
    try {
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: 'addProposal',
        account: address,
        args : [proposal]
      });
      await writeContract(request)
      getEvents()
      toast({
        title: 'Proposal added!',
        description: 'Your proposal is : ' + proposal,
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
    <Flex direction="column" mt="1rem" p="1rem" width="100%" border='0px' borderColor='gray.200' borderRadius="0.5rem">
      <Heading as='h3' size='xl'>Add Proposal</Heading>
      <Text fontStyle="italic">Time to submit your best proposal!</Text>
      <Flex mt="1rem" mb="2rem">
        <Input mr="0.5rem" placeholder="submit a proposal" onChange={e => setProposal(e.target.value)}/>
        <Button mr="0.5rem" colorScheme='whatsapp' onClick={() => addProposal()}>submit</Button>
      </Flex>
    </Flex>
  )
}

export default Proposal

