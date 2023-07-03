"use client"

// REACT
import { useEffect, useState } from 'react'

// CHAKRA-UI
import { Flex, Heading, Button, useToast, Text } from '@chakra-ui/react'

// WAGMI
import { readContract } from '@wagmi/core'
import { useAccount } from 'wagmi'

// CONTRACT
import Contract from '../../public/abi/Voting.json'


const VoteTallied = () => {

    /* Contract Address */
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS

    /* `toast` init */
    const toast = useToast()

    /* Reprendre les infos du wallet connecté */
    const { address } = useAccount()

    const [proposal, setProposal] = useState(null)
  
    const getWinningProposal = async() => {
        try {
        const data = await readContract({
            address: contractAddress,
            abi: Contract.abi,
            functionName: 'getWinningProposal',
            account: address
        });
        setProposal(data.description)
        }
        catch(err) {
        console.log(err)
        }
    }

    useEffect(() => {
        getWinningProposal()
    }, [])

  return (
    <Flex direction="column" mt="1rem" p="1rem" width="100%" border='0px' borderColor='gray.200' borderRadius="0.5rem">
      <Heading as='h3' size='xl'>Winning Proposal</Heading>
      <Text mt="1rem" fontStyle="italic">... and the winner is : <strong>{proposal} </strong></Text>
    </Flex>
  )
}

export default VoteTallied

