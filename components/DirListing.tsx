import { FilesObj } from '@/pages/[[...slug]]';
import { join } from 'path'
import SongRow from './SongRow';
import { MutableRefObject, useState } from 'react'
import type { PathMetaType } from '@/lib/PathMeta';
import type { FileMetaType } from '@/pages/[[...slug]]'

type DirListingProps = {
  path: string
  dirMeta: PathMetaType
  filesObj: FilesObj
  base: string
  audioRefs: MutableRefObject<Record<string, any>>
  className?: string
};

const DirListing = ({
  path,
  dirMeta = {},
  filesObj,
  base,
  audioRefs,
  className = "",
}: DirListingProps): JSX.Element | null => {

  const [activeKey, setActiveKey] = useState(null)
  const filesArr = Object.values(filesObj)

  if (dirMeta.sort === 'newest') {
    filesArr.sort((a: FileMetaType, b: FileMetaType) => {
      return b.mtime - a.mtime
    })
  } else if (dirMeta.sort === 'oldest') {
    filesArr.sort((a: FileMetaType, b: FileMetaType) => {
      return a.mtime - b.mtime
    })
  } else {
    // default to alpha
    filesArr.sort((a: FileMetaType, b: FileMetaType) => {
      return a.file.toLowerCase() > b.file.toLowerCase() ? 1 : -1
    })
  }
  let filesObjKeys = filesArr.map((e) => e.file.replace(/(-\d+)?.(wav|aif|mp3|m4a)$/, ""))

  if (dirMeta.tracks) {
    filesObjKeys = []
    for (const t of dirMeta.tracks) {
      if (filesObj[t.prefix]) {
        filesObj[t.prefix].title = t.title
        filesObjKeys.push(t.prefix)
      } else {
        console.error(`Invalid track prefix [${t.prefix}]. Skipping.`)
      }
    }
  }
  return (
    <div className={`${className}`}>
      {dirMeta.cover && <div className="">
        <img className="max-w-[24rem] shadow-xl m-auto mb-8" alt={dirMeta.title || dirMeta.cover} src={join(base, dirMeta.cover)} />
      </div>
      }
      {dirMeta.title && <h1 className="mb-4">{dirMeta.title}</h1>}
      {dirMeta.description && <p className="mb-8">{dirMeta.description}</p>}
      <div className="grid grod-cols-1 gap-4">
        {
          filesObjKeys.map((key, idx) => {
            //console.log({ path, key })
            return (
              <SongRow
                key={key}
                audioRefs={audioRefs}
                activeKey={activeKey}
                nextKey={idx < filesObjKeys.length - 1 ? filesObjKeys[idx + 1] : null}
                setActiveKey={setActiveKey}
                myKey={key}
                showCover={!dirMeta.cover}
                fileObj={filesObj[key]}
                path={path}
              />
            )
          })
        }
      </div>
    </div>
  )
}

export default DirListing;
