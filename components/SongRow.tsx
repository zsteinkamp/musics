"use client";

import moment from 'moment'
import Link from 'next/link'
import { MutableRefObject, useRef } from 'react'
import Timestamp from './Timestamp';

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

  const title = fileObj.title || myKey
  //console.info({ fileObj, title })

  return (
    <div key={myKey} className='grid sm:grid-cols-[6.5rem_1fr] gap-8'>
      <div className="hidden sm:block mb-8 w-[6.5rem]">{
        fileObj.coverPath ? (
          <div>
            <Link href={myKey}><img className="rounded-md" src={fileObj.coverPath} /></Link>
          </div>
        ) : (
          <Link href={myKey} className="block w-full aspect-square
             rounded-md
            sm:bg-shadebg-light
            sm:dark:bg-shadebg-dark 
          ">
            &nbsp;
          </Link>
        )
      }</div>
      <div className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr]">
          <h2 className="leading-normal truncate">
            <Link href={`${path}${myKey}`}>{title}</Link>
          </h2>
          <div className="hidden sm:block truncate ml-4">
            <p className="truncate text-right">{fileObj.file}</p>
            <Timestamp timestamp={fileObj.mtime} className="
              truncate text-right
            text-date-light dark:text-date-dark
              " />
          </div>
        </div>
        <div>
          <audio
            preload="none"
            className="w-full"
            ref={audioRef}
            controls
            onPlay={handlePlay} onPause={handlePause} onEnded={handleEnd}
            src={`/api/musics${path + fileObj.file}`}
          />
        </div>
      </div>
    </div >
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