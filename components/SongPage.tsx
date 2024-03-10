import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Timestamp from './Timestamp'
import DirLinks from './DirLinks'

type SongPageProps = {
  filesObj: Record<string, Record<string, any>>
  songPrefix: string
  path: string
  dirLinks: JSX.Element[]
};

const SongPage = ({
  filesObj,
  songPrefix,
  path,
  dirLinks,
}: SongPageProps): JSX.Element | null => {
  //console.log({ filesObj, songPrefix, path })

  const fileObj = filesObj[songPrefix]

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

  const [selFile, setSelFile] = useState(filesObj[songPrefix].children[0] as Record<string, any>)

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
      <div className="md:grid md:grid-cols-[1fr_3fr]">
        <DirLinks dirLinks={dirLinks} className="mb-8" />
        <div className="">
          {fileObj.coverPath && (
            <div className="">
              <img className="w-full object-cover p-4 shadow-xl" src={fileObj.coverPath} />
            </div>)}
          <h1 className="text-5xl font-header mt-8 mb-4 text-center ">{title}</h1>
          <div className="">
            <audio
              preload="none"
              className="w-full"
              controls
              autoPlay={false}
              src={`/api/musics${path + selFile.file}`}
            />
            <p className="text-center mt-2">{(path + selFile.file).substring(1)}</p>
            <div className="mt-8">
              {filesObj[songPrefix].children.map((f: Record<string, any>, i: number) => {
                return (<div className="p-4 cursor-pointer
                has-[:checked]:bg-shadebg-light
                has-[:checked]:color-shadetext-light
                dark:has-[:checked]:bg-shadebg-dark
                dark:has-[:checked]:color-shadetext-dark
                " key={f.file}>
                  <label className="">
                    <input type="radio" className="hidden" name="takes" value={f.file} key={f.file} checked={f === selFile} onChange={() => setSelFile(f)} />
                    {f.file.substring(0)}
                    <Timestamp timestamp={fileObj.mtime} />
                  </label>
                </div>)
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SongPage
