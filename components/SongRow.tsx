"use client";

import moment from 'moment'
import Link from 'next/link'
import { MutableRefObject, useRef } from 'react'

const ftime = (epochTimeMs: number): string => {
  return moment(epochTimeMs).format("YYYY-MM-DD HH:mm");
};

type SongRowProps = {
  fileObj: Record<string, any>;
  myKey: string;
  activeKey: string | null;
  setActiveKey: Function;
  audioRefs: MutableRefObject<Record<string, any>>;
  path: string;
};

const SongRow = ({
  fileObj,
  myKey,
  activeKey,
  setActiveKey,
  audioRefs,
  path
}: SongRowProps): JSX.Element | null => {
  const cover = fileObj.coverPath && (
    <div className="cover">
      <Link href={myKey}><img src={fileObj.coverPath} /></Link>
    </div>
  );
  const mtime = ftime(fileObj.mtime);

  const audioRef = useRef<HTMLAudioElement>(null);
  audioRefs.current[myKey] = audioRef;

  const handlePlay = () => {
    if (activeKey === myKey) {
      audioRef.current?.play();
    } else {
      // Clicked on a different recording, pause the current one (if any) and play the new one
      if (activeKey !== null && audioRefs.current[activeKey] && audioRefs.current[activeKey].current) {
        audioRefs.current[activeKey].current.pause();
      }
      audioRef.current?.play();
      setActiveKey(myKey);
    }
  };

  const handlePause = () => {
    if (activeKey === myKey) {
      audioRef && audioRef.current && audioRef.current.pause();
    }
  };

  //console.log({ path, myKey })

  return (
    <div key={myKey} className="songRow">
      <div className="coverouter">{cover}</div>
      <div className="metaplayer">
        <div className="meta">
          <h2><Link href={`${path}${myKey}`}>{myKey}</Link></h2>
          <div>
            <p className="fname">{fileObj.file}</p>
            <p className="mtime" suppressHydrationWarning>{mtime}</p>
          </div>
        </div>
        <div>
          <audio
            preload="none"
            ref={audioRef}
            controls
            onPlay={handlePlay} onPause={handlePause}
            src={`/api/musics${path + fileObj.file}`}
          />
        </div>
      </div>
    </div>
  );
  //      {fileObj.children && (
  //        <div className="children">
  //          {fileObj.children.map((obj: Record<string, any>, i) => {
  //            return (
  //              <p>
  //                {obj.file} - {ftime(obj.mtime)}
  //              </p>
  //            );
  //          })}
  //        </div>
  //      )}
};

export default SongRow;