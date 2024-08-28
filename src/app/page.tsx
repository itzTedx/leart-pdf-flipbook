import dynamic from 'next/dynamic'
// import FlipBook from './Flipbook'

const FlipBook = dynamic(() => import('./Flipbook'))

export default function Home() {
  return <FlipBook />
}
