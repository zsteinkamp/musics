import Link from "next/link";
import { join } from 'path'

type DirLinksProps = {
  path: string
  dirList: string[]
  className: String
};

const DirLinks = ({
  path,
  dirList,
  className = "",
}: DirLinksProps): JSX.Element | null => {
  const dirLinks = (dirList || []).map((dir: string, i: number) => {
    return (
      <div key={i.toString()} className="py-2">
        <Link className="" href={join(path, dir)}>
          /&nbsp;{dir}
        </Link>
      </div>
    )
  })
  return (
    <div className={`relative ${className}`}>
      <div className="truncate font-header
        grid grid-cols-2 md:block
      text-headertext-light dark:text-headertext-dark
        md:min-h-[80vh] md:sticky md:top-4
       ">
        {dirLinks}
      </div>
    </div>
  )
}

export default DirLinks