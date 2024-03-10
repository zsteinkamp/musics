import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Timestamp from './Timestamp'

type SongPageProps = {
  filesObj: Record<string, Record<string, any>>
  songPrefix: string
  path: string
  className?: string
};

const SongPage = ({
  filesObj,
  songPrefix,
  path,
  className = "",
}: SongPageProps): JSX.Element | null => {
  const pathParts = path.split("/")
  const parentPath = pathParts.slice(0, pathParts.length - 2).join("/")
  const fileObj = filesObj[songPrefix]

  //console.log({ fileObj, songPrefix, path, parentPath })

  if (fileObj) {

    let pathLinks = []
    const pathParts = path.split('/').filter((e) => !!e)
    //console.log({ pathparts: pathParts.join(',') })
    let pathAccum = ''
    for (const pathPart of pathParts) {
      pathLinks.push(<span key={`s${pathPart}`}>/</span>)
      const newAccum = `${pathAccum}/${pathPart}`
      pathLinks.push(
        <em key={`l${pathPart}`}><Link href={newAccum}>{pathPart}</Link></em>
      )
      pathAccum = newAccum
      //console.log({ pathAccum })
    }

    //const fullPrefix = join(path, songPrefix)

  }
  const [selFile, setSelFile] = useState(fileObj && fileObj.children[0] as Record<string, any>)

  //console.log({ fileObj, filesObj: filesObj })

  const title = songPrefix.substring(0)

  return selFile && selFile.file && (
    <>
      <Head>
        <title>{title}</title>
        <meta property="og:type" content="music:song" />
        <meta property="og:locale" content="en_US" />
        <meta property="title" content={title} />
        <meta property="og:title" content={title} />
        {<meta property="og:description" content="by Zack Steinkamp" />}
        {<meta property="og:image" content={`https://musics.steinkamp.us${fileObj.coverPath}`} />}
      </Head>
      <div className={className}>
        {fileObj.coverPath && (
          <div className="">
            <img className="w-full object-cover p-4 shadow-xl" src={fileObj.coverPath} />
          </div>)}
        <h1 className="mt-8 mb-4 text-center truncate">
          {title}
        </h1>
        <div className="">
          <audio
            preload="none"
            className="w-full"
            controls
            autoPlay={true}
            src={`/api/musics${parentPath + '/' + selFile.file}`}
          />
          <p className="text-center mt-2">{(path + selFile.file).substring(1)}</p>
          <div className="mt-8">
            {filesObj[songPrefix].children.map((f: Record<string, any>, i: number) => {
              return (
                <label className="
                    cursor-pointer block p-4
                    rounded-xl
                    bg-gradient-to-l
                    has-[:checked]:from-shadebg-light
                    has-[:checked]:to-pagebg-light
                    has-[:checked]:dark:to-pagebg-dark
                    has-[:checked]:dark:from-shadebg-dark
                    " key={f.file}>
                  <input type="radio" className="hidden" name="takes"
                    value={f.file} key={f.file} checked={f === selFile}
                    onChange={() => setSelFile(f)}
                  />
                  {f.file.substring(0)}
                  <Timestamp timestamp={fileObj.mtime} />
                </label>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

export default SongPage
