import Image from 'next/image'
import styles from './page.module.css'
import Layout from '@/components/Layout/Layout'
import Voting from '@/components/Voting/Voting'


export default function Home() {
  return (
    <Layout>
      <Voting />
    </Layout>
  )
}
