import { useState } from 'react'
import moment from 'moment'

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

  const fileObj = filesObj[songPrefix]

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

  const adjPath = songPrefix ? path.substring(0, path.length - songPrefix.length) : path

  return (
    <>
      {selFile && selFile.file && (
        <div className="songPage" key="a">
          {cover}
          <h1 className="fname">{songPrefix.substring(1)}</h1>
          <div className="audioHolder">
            <audio
              preload="none"
              controls
              autoPlay
              src={`/api/musics${adjPath + selFile.file}`}
            />
            <p>{(adjPath + selFile.file).substring(1)}</p>
            <div className="childList">
              {filesObj[songPrefix].children.map((f: Record<string, any>, i: number) => {
                return (<div key={f.file}>
                  <label>
                    <input type="radio" name="takes" value={f.file} key={f.file} checked={f === selFile} onChange={() => setSelFile(f)} />
                    {f.file.substring(1)}
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