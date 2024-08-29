import dynamic from 'next/dynamic'
// import FlipBook from './Flipbook'

const FlipBook = dynamic(() => import('./Flipbook-v2'))

export default function Home() {
  return <FlipBook />
}
