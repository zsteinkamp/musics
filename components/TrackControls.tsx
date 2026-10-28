import { usePlayer, Track } from '@/lib/player'
import { AddToQueueIcon, PauseIcon, PlayIcon, PlayNextIcon } from './Icons'

export const buttonBase = `inline-flex items-center justify-center gap-1
  rounded-full whitespace-nowrap font-header
  transition-colors disabled:opacity-40 disabled:pointer-events-none`

export const primaryButton = `${buttonBase} text-white
  bg-link-base-light dark:bg-link-base-dark
  hover:bg-link-hover-light hover:dark:bg-link-hover-dark hover:dark:text-pagebg-dark`

export const secondaryButton = `${buttonBase}
  bg-shadebg-light dark:bg-shadebg-dark
  text-headertext-light dark:text-headertext-dark
  hover:text-link-hover-light hover:dark:text-link-hover-dark`

type TrackProps = {
  track: Track
  className?: string
}

// play/pause for a single song. Play plays just this song. Icon-only unless showLabel.
export function PlayToggleButton({ track, className = '', showLabel = false }: TrackProps & { showLabel?: boolean }) {
  const { current, playing, playNow, togglePlay } = usePlayer()
  const isPlaying = current?.src === track.src && playing
  const label = isPlaying ? 'Pause' : 'Play'

  return (
    <button
      className={`${primaryButton} ${showLabel ? 'pl-3 pr-4 py-1' : 'p-1.5'} ${className}`}
      title={label} aria-label={label}
      onClick={() => (current?.src === track.src ? togglePlay() : playNow(track))}
    >
      {isPlaying ? <PauseIcon /> : <PlayIcon />}
      {showLabel && label}
    </button>
  )
}

export function QueueButtons({ track, className = '' }: TrackProps) {
  const { enqueue } = usePlayer()
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button className={`${secondaryButton} p-1.5`} title='Play next' aria-label='Play next'
        onClick={() => enqueue([track], 'next')}>
        <PlayNextIcon />
      </button>
      <button className={`${secondaryButton} p-1.5`} title='Add to queue' aria-label='Add to queue'
        onClick={() => enqueue([track], 'end')}>
        <AddToQueueIcon />
      </button>
    </div>
  )
}

// labelled play button plus queue buttons, for the single-song page
export default function TrackControls({ track, className = '' }: TrackProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 text-sm ${className}`}>
      <PlayToggleButton track={track} showLabel />
      <QueueButtons track={track} />
    </div>
  )
}
