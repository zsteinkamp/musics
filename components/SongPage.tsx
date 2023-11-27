import { useState } from 'react'
import moment from 'moment'
import Head from 'next/head'
import Link from 'next/link'

type SongPageProps = {
  filesObj: Record<string, Record<string, any>>;
  songPrefix: string;
  path: string;
};

const SongPage = ({
  filesObj,
  songPrefix,
  path,
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

  const ftime = (epochTimeMs: number): string => {
    return moment(epochTimeMs).format("YYYY-MM-DD ddd HH:mm");
  };

  //console.log({ fileObj, filesObj: filesObj })

  const cover = fileObj.coverPath && (
    <div className="cover">
      <img src={fileObj.coverPath} />
    </div>
  );
  const mtime = ftime(fileObj.mtime);

  const adjPath = path //.substring(0, path.length - songPrefix.length)

  const title = songPrefix.substring(0)

  return (
    <>
      {selFile && selFile.file && (
        <div className="songPage">
          <Head>
            <title>{title}</title>
            <meta property="og:type" content="music:song" />
            <meta property="og:locale" content="en_US" />
            <meta property="title" content={title} />
            <meta property="og:title" content={title} />
            {<meta property="og:description" content="by Zack Steinkamp" />}
            {<meta property="og:image" content={`https://musics.steinkamp.us${fileObj.coverPath}`} />}
          </Head>
          <h1><Link href="/">MUSICS</Link> {pathLinks}</h1>
          {cover}
          <h1 className="fname">{title}</h1>
          <div className="audioHolder">
            <audio
              preload="none"
              controls
              autoPlay={true}
              src={`/api/musics${adjPath + selFile.file}`}
            />
            <p>{(adjPath + selFile.file).substring(0)}</p>
            <div className="childList">
              {filesObj[songPrefix].children.map((f: Record<string, any>, i: number) => {
                return (<div key={f.file}>
                  <label>
                    <input type="radio" name="takes" value={f.file} key={f.file} checked={f === selFile} onChange={() => setSelFile(f)} />
                    {f.file.substring(0)}
                    <span className="fileDate" suppressHydrationWarning>{ftime(f.mtime)}</span>
                  </label>
                </div>)
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SongPage