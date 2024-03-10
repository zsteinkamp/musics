import Link from "next/link"
import ThemeSwitcher from "@/components/ThemeSwitcher"

type HeaderProps = {
  pathLinks: JSX.Element[]
  className?: string
};

const Header = ({
  pathLinks,
  className = "",
}: HeaderProps): JSX.Element | null => {
  return (
    <div className="grid grid-cols-[1fr_2rem]">
      <h2 className={`text-3xl mb-8 truncate ${className}`}>
        <Link href="/">MUSICS</Link>
        {pathLinks}
      </h2>
      <ThemeSwitcher className="mb-8" />
    </div>
  )
}

export default Header