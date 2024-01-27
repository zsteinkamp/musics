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
  showCover: boolean;
  activeKey: string | null;
  nextKey: string | null;
  setActiveKey: Function;
  audioRefs: MutableRefObject<Record<string, any>>;
  path: string;
};

const SongRow = ({
  fileObj,
  myKey,
  showCover,
  activeKey,
  nextKey,
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
    //console.log('IN HANDLEPLAY')
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
    //console.log('IN HANDLEPAUSE')
    if (activeKey === myKey) {
      audioRef && audioRef.current && audioRef.current.pause();
    }
  };

  //console.log({ path, myKey })

  const handleEnd = () => {
    //console.log('IN HANDLEEND')
    if (nextKey === null || !audioRefs.current) {
      // should not happen
      return;
    }

    // play the next song
    audioRefs.current[nextKey] && audioRefs.current[nextKey].current.play()
  };

  const title = fileObj.title || fileObj.file
  //console.info({ fileObj, title })

  return (
    <div key={myKey} className="songRow">
      <div className={`coverouter ${!showCover && "zerowidth"}`}>{cover}</div>
      <div className="metaplayer">
        <div className="meta">
          <h2><Link href={`${path}${myKey}`}>{title}</Link></h2>
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
            onPlay={handlePlay} onPause={handlePause} onEnded={handleEnd}
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