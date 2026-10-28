// Inline stroke icons on a 24px grid; size follows font size, color follows text color.
type IconProps = {
  className?: string
}

const Icon = ({ className = '', children }: IconProps & { children: React.ReactNode }) => (
  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2}
    strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'
    className={`inline-block w-[1.25em] h-[1.25em] ${className}`}>
    {children}
  </svg>
)

export const PlayIcon = (p: IconProps) => (
  <Icon {...p}><path d='M7 4.5v15l12-7.5z' fill='currentColor' /></Icon>
)

export const PauseIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x='6' y='5' width='4' height='14' rx='1' fill='currentColor' />
    <rect x='14' y='5' width='4' height='14' rx='1' fill='currentColor' />
  </Icon>
)

// list with a play marker on the top line: "insert at the front of the queue"
export const PlayNextIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d='M3 4v6l5-3z' fill='currentColor' />
    <path d='M11 7h10M3 13h18M3 19h18' />
  </Icon>
)

// list with a plus after the last line: "append to the end of the queue"
export const AddToQueueIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d='M3 5h16M3 11h16M3 17h9M18 14v6M15 17h6' />
  </Icon>
)

export const SkipNextIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d='M5 5v14l10-7z' fill='currentColor' />
    <path d='M19 5v14' />
  </Icon>
)

export const QueueIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d='M9 6h12M9 12h12M9 18h12' />
    <circle cx='4' cy='6' r='1' fill='currentColor' />
    <circle cx='4' cy='12' r='1' fill='currentColor' />
    <circle cx='4' cy='18' r='1' fill='currentColor' />
  </Icon>
)

export const RemoveIcon = (p: IconProps) => (
  <Icon {...p}><path d='M6 6l12 12M18 6L6 18' /></Icon>
)

export const ClearIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d='M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3' />
  </Icon>
)
