import Link from "next/link";
import { join } from 'path'
import GenericRow from "./GenericRow";
import { PathMetaType } from "@/lib/PathMeta";

type DirLinksProps = {
  path: string
  dirs: string[]
  subdirMeta: PathMetaType
  className?: string
};

const getDirLinks = ({ dirs, path, subdirMeta }: DirLinksProps): JSX.Element[] => {
  console.log({ dirs, path, subdirMeta })
  return dirs.map((dir: string, i: number) => {
    const dirMeta = subdirMeta[dir]
    return (
      <GenericRow key={i.toString()} className="py-0"
        cover={dirMeta.cover ? (
          <div>
            <Link href={dir}><img className="rounded-md" src={join('/musics', dir, dirMeta.cover)} /></Link>
          </div>
        ) : (
          <Link href={dir} className="block w-full aspect-square
             rounded-md
            sm:bg-shadebg-light
            sm:dark:bg-shadebg-dark 
          ">
            &nbsp;
          </Link>
        )
        }
        body={(
          <h2 className="truncate leading-normal">
            <Link className="truncate" href={join(path, dir)}>
              /&nbsp;{dir}
            </Link>
          </h2>
        )} />
    )
  })
}

const DirLinks = ({
  path,
  dirs,
  subdirMeta,
  className = "",
}: DirLinksProps): JSX.Element => {
  const dirLinks = getDirLinks({ dirs, path, subdirMeta })
  return (
    <div className={className}>
      <div className="truncate font-header
        grid grid-cols-2 gap-4
      text-headertext-light dark:text-headertext-dark
       ">
        {dirLinks}
      </div>
    </div>
  )
}

export default DirLinks