"use client"

import { useEffect } from 'react'

// CHAKRA-UI
import { Flex, Text, Heading } from '@chakra-ui/react'

// WAGMI
import { useAccount } from 'wagmi'

//Unique id generator
import { v4 as uuidv4 } from 'uuid';

const SCEvents = ({ getEvents, voterAddressEvents, proposalEvents, voteEvents }) => {

    /* Reprendre les infos du wallet connecté */
    const { address } = useAccount()

    useEffect(() => {
        const getEventsHandler = async() => {
            if(address !== 'undefined') {
                await getEvents()
            }
        }
        getEventsHandler()
    }, [address])

  return (
    <>    
    <Flex direction="row" mt="3rem">
        <Flex direction="column" p="1rem" width="100%" border='1px' borderColor='blue.200' borderRadius="0.5rem">
            <Heading as="h2" size="md" mb="1rem">Voters ({voterAddressEvents.length})</Heading>
            { voterAddressEvents.length > 0 ? voterAddressEvents.map((event, key) => {
                return <Flex key={uuidv4()}>
                <Text>{ key + ' : ' +  event.voterAddress }</Text>
                </Flex>
            }):(
                <Text>No voter registered yet</Text>
            )}
        </Flex>
        <Flex direction="column" ml="1rem" p="1rem" width="100%" border='1px' borderColor='blue.200' borderRadius="0.5rem">
            <Heading as="h2" size="md" mb="1rem">Proposals({proposalEvents.length})</Heading>
            { proposalEvents.length > 0 ? proposalEvents.map((event) => {
                return <Flex key={uuidv4()}>
                <Text>{ 'proposal#' +  event.proposalId + '  :  ' + event.description }</Text>
                </Flex>
            }):(
                <Text>No proposal registered yet</Text>
            )}
        </Flex>
    </Flex>
    <Flex direction="row" mt="1rem">
        <Flex direction="column" p="1rem" width="100%" border='1px' borderColor='blue.200' borderRadius="0.5rem">
                <Heading as="h2" size="md" mb="1rem">Votes ({voteEvents.length})</Heading>
                { voteEvents.length > 0 ? voteEvents.map((event) => {
                    return <Flex key={uuidv4()}>
                    <Text>{ event.voter + ' has voted for proposal#' +  event.proposalId + '  :  ' + event.description }</Text>
                    </Flex>
                }):(
                    <Text>No proposal registered yet</Text>
                )}
        </Flex>
    </Flex>

    </>
  )
}

export default SCEvents