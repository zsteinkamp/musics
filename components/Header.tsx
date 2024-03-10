import Link from "next/link"
import ThemeSwitcher from "@/components/ThemeSwitcher"

type HeaderProps = {
  path: string
  className?: string
};

const Header = ({
  path,
  className = "",
}: HeaderProps): JSX.Element | null => {
  let pathAccum = '', newAccum
  const pathLinks = path.substring(1).split('/').filter((e) => !!e).map((pathPart, i, arr) => {
    newAccum = `${pathAccum}/${pathPart}`
    const ret = (<span key={i}>
      <span className="ml-2 mr-2" key={`s${pathPart}`}>/</span>
      <span className="" key={`e${pathPart}`}>
        {(i < (arr.length - 1)) ? (
          <Link href={newAccum}>{pathPart}</Link>
        ) : (
          <span>{pathPart}</span>
        )}
      </span>
    </span>)
    pathAccum = newAccum

    return ret
  })

  return (
    <div className="grid grid-cols-[1fr_2rem] gap-4">
      <h1 className={`mb-8 truncate ${className}`}>
        <Link href="/">MUSICS</Link>
        {pathLinks}
      </h1>
      <ThemeSwitcher className="mb-8" />
    </div>
  )
}

export default Header