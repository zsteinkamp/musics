import Link from 'next/link'
import { useState } from 'react'
import { usePlayer } from '@/lib/player'
import { ClearIcon, PlayIcon, QueueIcon, RemoveIcon, SkipNextIcon } from './Icons'

const smallButton = `px-2 py-1 rounded-md whitespace-nowrap
  text-link-base-light dark:text-link-base-dark
  hover:text-link-hover-light hover:dark:text-link-hover-dark
  hover:bg-shadebg-light hover:dark:bg-shadebg-dark
  disabled:opacity-40 disabled:pointer-events-none`

export default function PlayerBar() {
  const {
    current,
    queue,
    continuous,
    audioRef,
    next,
    playFromQueue,
    removeFromQueue,
    clearQueue,
    setContinuous,
    onAudioPlay,
    onAudioPause,
    onAudioEnded,
    onAudioTimeUpdate,
    onAudioLoadedMetadata,
  } = usePlayer()
  const [showQueue, setShowQueue] = useState(false)

  if (!current && !queue.length) {
    return null
  }

  return (
    <div className='fixed inset-x-0 bottom-0 z-10 border-t
      border-shadebg-light dark:border-shadebg-dark
      bg-pagebg-light/95 dark:bg-pagebg-dark/95 backdrop-blur'>
      <div className='max-w-4xl m-auto px-4 sm:px-8'>
        {showQueue && (
          <div className='max-h-[50dvh] overflow-y-auto pt-4'>
            <div className='flex items-center gap-2 mb-2'>
              <h3 className='flex-1'>Up next</h3>
              <label className='flex items-center gap-1 cursor-pointer text-sm'>
                <input type='checkbox' checked={continuous}
                  onChange={(e) => setContinuous(e.target.checked)} />
                Auto-play queue
              </label>
              <button className={smallButton} onClick={clearQueue} disabled={!queue.length}
                title='Clear queue' aria-label='Clear queue'>
                <ClearIcon />
              </button>
            </div>
            {queue.length ? (
              <ol>
                {queue.map((item, i) => (
                  <li key={item.qid} className='flex items-center gap-2 py-1'>
                    <span className='w-6 text-right text-date-light dark:text-date-dark'>{i + 1}</span>
                    <div className='flex-1 truncate'>
                      <Link href={item.href}>{item.title}</Link>
                      {item.album && (
                        <span className='ml-2 text-date-light dark:text-date-dark'>{item.album}</span>
                      )}
                    </div>
                    <button className={smallButton} title='Play now' aria-label='Play now'
                      onClick={() => playFromQueue(item.qid)}><PlayIcon /></button>
                    <button className={smallButton} title='Remove from queue' aria-label='Remove from queue'
                      onClick={() => removeFromQueue(item.qid)}><RemoveIcon /></button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className='py-2 text-date-light dark:text-date-dark'>The queue is empty.</p>
            )}
          </div>
        )}
        <div className='flex items-center gap-3 py-2'>
          {current?.cover && (
            <Link href={current.href} className='hidden sm:block shrink-0'>
              <img className='w-12 h-12 rounded-md object-cover' src={current.cover} alt='' />
            </Link>
          )}
          <div className='w-1/3 min-w-0'>
            {current ? (
              <>
                <div className='truncate font-header font-bold'>
                  <Link href={current.href}>{current.title}</Link>
                </div>
                {current.album && <div className='truncate text-sm'>{current.album}</div>}
              </>
            ) : (
              <div className='truncate'>Nothing playing</div>
            )}
          </div>
          <div className='flex-1 min-w-0'>
            {current && (
              <audio
                ref={audioRef}
                className='w-full'
                controls
                preload='none'
                src={current.src}
                onPlay={onAudioPlay}
                onPause={onAudioPause}
                onEnded={onAudioEnded}
                onTimeUpdate={onAudioTimeUpdate}
                onLoadedMetadata={onAudioLoadedMetadata}
              />
            )}
          </div>
          <button className={smallButton} title='Next in queue' aria-label='Next in queue'
            onClick={next} disabled={!queue.length}><SkipNextIcon /></button>
          <button className={`${smallButton} relative ${showQueue ? 'bg-shadebg-light dark:bg-shadebg-dark' : ''}`}
            title={showQueue ? 'Hide queue' : 'Show queue'} aria-label='Queue' aria-expanded={showQueue}
            onClick={() => setShowQueue(!showQueue)}>
            <QueueIcon />
            {queue.length > 0 && (
              <span className='absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 rounded-full
                text-xs leading-5 text-center text-white bg-link-base-light dark:bg-link-base-dark'>
                {queue.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
