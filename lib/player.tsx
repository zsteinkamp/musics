import {
  createContext,
  MutableRefObject,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

export type Track = {
  src: string
  title: string
  href: string
  cover?: string
  album?: string
}

// a Track as it sits in the player; qid distinguishes repeated copies of a track
export type QueueItem = Track & { qid: string }

export type QueuePosition = 'next' | 'end'

type PlayerContextType = {
  current: QueueItem | null
  queue: QueueItem[]
  playing: boolean
  // when true, the next queue item starts automatically when the current one ends
  continuous: boolean
  audioRef: MutableRefObject<HTMLAudioElement | null>
  playNow: (track: Track) => void
  playAll: (tracks: Track[]) => void
  enqueue: (tracks: Track[], position: QueuePosition) => void
  playFromQueue: (qid: string) => void
  removeFromQueue: (qid: string) => void
  clearQueue: () => void
  next: () => void
  togglePlay: () => void
  setContinuous: (continuous: boolean) => void
  // audio element event hooks, wired up by PlayerBar
  onAudioPlay: () => void
  onAudioPause: () => void
  onAudioEnded: () => void
  onAudioTimeUpdate: () => void
  onAudioLoadedMetadata: () => void
}

const STORAGE_KEY = 'musics.player'

const PlayerContext = createContext<PlayerContextType | null>(null)

export function usePlayer(): PlayerContextType {
  const ctx = useContext(PlayerContext)
  if (!ctx) {
    throw new Error('usePlayer must be used inside PlayerProvider')
  }
  return ctx
}

// crypto.randomUUID is unavailable on plain-http LAN origins, so roll our own
const newQid = () => Math.random().toString(36).slice(2) + Date.now().toString(36)

const toItem = (track: Track): QueueItem => ({ ...track, qid: newQid() })

type SavedState = {
  current: QueueItem | null
  queue: QueueItem[]
  continuous: boolean
  time: number
}

const loadState = (): SavedState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SavedState) : null
  } catch {
    return null
  }
}

const saveState = (state: SavedState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage unavailable (private mode etc.); persistence is best-effort
  }
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<QueueItem | null>(null)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [playing, setPlaying] = useState(false)
  const [continuous, setContinuous] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  // set when a change of `current` should start playback (vs. a restore on page load)
  const shouldPlay = useRef(false)
  // playback position to seek to once a restored track's metadata loads
  const restoreTime = useRef(0)
  const lastSave = useRef(0)

  // restore after mount so server and client render the same initial markup
  useEffect(() => {
    const saved = loadState()
    if (saved) {
      setCurrent(saved.current)
      setQueue(saved.queue || [])
      setContinuous(!!saved.continuous)
      restoreTime.current = saved.time || 0
    }
    setLoaded(true)
  }, [])

  const persist = useCallback(() => {
    if (!loaded) {
      return
    }
    saveState({
      current,
      queue,
      continuous,
      time: audioRef.current?.currentTime || restoreTime.current,
    })
  }, [loaded, current, queue, continuous])

  useEffect(persist, [persist])

  // start playback whenever a user action changed the current track
  useEffect(() => {
    if (current && shouldPlay.current) {
      shouldPlay.current = false
      audioRef.current?.play().catch(() => setPlaying(false))
    }
  }, [current])

  const start = useCallback((item: QueueItem, isContinuous: boolean) => {
    restoreTime.current = 0
    setContinuous(isContinuous)
    if (current && current.qid === item.qid) {
      audioRef.current?.play()
      return
    }
    shouldPlay.current = true
    setCurrent(item)
  }, [current])

  const playNow = useCallback((track: Track) => {
    start(toItem(track), false)
  }, [start])

  const playAll = useCallback((tracks: Track[]) => {
    if (!tracks.length) {
      return
    }
    const items = tracks.map(toItem)
    // rest of the album goes ahead of whatever was already queued
    setQueue((q) => [...items.slice(1), ...q])
    start(items[0], true)
  }, [start])

  const enqueue = useCallback((tracks: Track[], position: QueuePosition) => {
    const items = tracks.map(toItem)
    setQueue((q) => (position === 'next' ? [...items, ...q] : [...q, ...items]))
  }, [])

  const playFromQueue = useCallback((qid: string) => {
    const item = queue.find((i) => i.qid === qid)
    if (!item) {
      return
    }
    setQueue((q) => q.filter((i) => i.qid !== qid))
    start(item, true)
  }, [queue, start])

  const removeFromQueue = useCallback((qid: string) => {
    setQueue((q) => q.filter((i) => i.qid !== qid))
  }, [])

  const clearQueue = useCallback(() => setQueue([]), [])

  const next = useCallback(() => {
    if (queue.length) {
      playFromQueue(queue[0].qid)
    }
  }, [queue, playFromQueue])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) {
      return
    }
    if (audio.paused) {
      audio.play().catch(() => setPlaying(false))
    } else {
      audio.pause()
    }
  }, [])

  const onAudioEnded = useCallback(() => {
    if (continuous && queue.length) {
      next()
    } else {
      setPlaying(false)
    }
  }, [continuous, queue, next])

  const onAudioTimeUpdate = useCallback(() => {
    const now = Date.now()
    if (now - lastSave.current > 5000) {
      lastSave.current = now
      persist()
    }
  }, [persist])

  const onAudioLoadedMetadata = useCallback(() => {
    if (audioRef.current && restoreTime.current) {
      audioRef.current.currentTime = restoreTime.current
      restoreTime.current = 0
    }
  }, [])

  // lock-screen / media-key integration
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
      return
    }
    navigator.mediaSession.metadata = current
      ? new MediaMetadata({
          title: current.title,
          album: current.album || '',
          artwork: current.cover ? [{ src: current.cover }] : [],
        })
      : null
    navigator.mediaSession.setActionHandler('nexttrack', queue.length ? next : null)
  }, [current, queue, next])

  const value: PlayerContextType = {
    current,
    queue,
    playing,
    continuous,
    audioRef,
    playNow,
    playAll,
    enqueue,
    playFromQueue,
    removeFromQueue,
    clearQueue,
    next,
    togglePlay,
    setContinuous,
    onAudioPlay: () => setPlaying(true),
    onAudioPause: () => {
      setPlaying(false)
      persist()
    },
    onAudioEnded,
    onAudioTimeUpdate,
    onAudioLoadedMetadata,
  }

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}
