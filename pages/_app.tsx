import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { PlayerProvider } from '@/lib/player'
import PlayerBar from '@/components/PlayerBar'

// _app stays mounted across client-side navigation, so the player (and its single
// <audio> element) keeps playing while the user browses.
export default function App({ Component, pageProps }: AppProps) {
  return (
    <PlayerProvider>
      <Component {...pageProps} />
      <PlayerBar />
    </PlayerProvider>
  )
}
