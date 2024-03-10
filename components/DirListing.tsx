import { FilesObj } from '@/pages/[[...slug]]';
import { join } from 'path'
import SongRow from './SongRow';
import { MutableRefObject, useState } from 'react'

type DirListingProps = {
  path: string
  dirMeta: Record<string, any>
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

  let filesObjKeys = Object.keys(filesObj)

  if (dirMeta.tracks) {
    filesObjKeys = []
    for (const t of dirMeta.tracks) {
      if (filesObj[t.prefix]) {
        filesObjKeys.push(t.prefix)
        filesObj[t.prefix].title = t.title
        //console.info(`Pushed prefix ${t.prefix}.`)
      } else {
        console.error(`Invalid track prefix [${t.prefix}]. Skipping.`)
      }
    }
  }
  return (
    <div className={className}>
      {dirMeta.cover && <div className="cover">
        <img alt={dirMeta.title || dirMeta.cover} src={join(base, dirMeta.cover)} />
      </div>
      }
      {dirMeta.title && <h2 className="
      text-headertext-light dark:text-headertext-dark
        font-header text-5xl my-4 font-bold
      ">{dirMeta.title}</h2>}
      {dirMeta.description && <p className="mb-8">{dirMeta.description}</p>}
      {
        filesObjKeys.map((key, idx) => {
          //console.log({ path, key })
          return (
            <div key={key} className="">
              <SongRow
                audioRefs={audioRefs}
                activeKey={activeKey}
                nextKey={idx < filesObjKeys.length - 1 ? filesObjKeys[idx + 1] : null}
                setActiveKey={setActiveKey}
                myKey={key}
                showCover={!dirMeta.cover}
                fileObj={filesObj[key]}
                path={path}
              />
            </div>
          )
        })
      }
    </div>
  )
}

export default DirListing;