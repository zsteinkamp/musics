type GenericRowProps = {
  cover: JSX.Element
  body: JSX.Element
  className?: string
}
export default function GenericRow({ cover, body, className = '' }: GenericRowProps) {
  return (
    <div className={`grid sm:grid-cols-[6.5rem_1fr] gap-4 items-center ${className}`}>
      <div className="hidden sm:block w-[5.75rem]">
        {cover}
      </div>
      <div className="overflow-hidden">
        {body}
      </div>
    </div>
  )
}