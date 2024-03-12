export type CoverImageProps = {
  src: string
  title: string
  className?: string
}
export default function CoverImage({ src, title, className }: CoverImageProps): JSX.Element {
  return (
    <div className={className}>
      <img className="max-h-[24rem] shadow-xl m-auto" alt={title} src={src} />
    </div>

  )
}