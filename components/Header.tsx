import Link from "next/link";

type HeaderProps = {
  pathLinks: JSX.Element[]
  className?: string
};

const Header = ({
  pathLinks,
  className = "",
}: HeaderProps): JSX.Element | null => {
  return (
    <h1 className={`text-headertext-light dark:text-headertext-dark text-4xl md:text-4xl
      font-header mb-8 truncate ${className}`}>
      <Link href="/">MUSICS</Link>
      {pathLinks}
    </h1>
  )
}

export default Header