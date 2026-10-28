"use client";

import Link from 'next/link'
import Timestamp from './Timestamp';
import GenericRow from './GenericRow';
import { PlayToggleButton, QueueButtons } from './TrackControls';
import { usePlayer, Track } from '@/lib/player';

type SongRowProps = {
  fileObj: Record<string, any>;
  myKey: string;
  showCover: boolean;
  track: Track;
  path: string;
};

const SongRow = ({
  fileObj,
  myKey,
  showCover,
  track,
  path
}: SongRowProps): JSX.Element | null => {
  const { current } = usePlayer()
  const isCurrent = current?.src === track.src

  const title = fileObj.title || myKey

  return (
    <GenericRow key={myKey}
      className={`rounded-md ${isCurrent ? 'bg-shadebg-light/60 dark:bg-shadebg-dark/60' : ''}`}
      cover={fileObj.coverPath ? (
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
      }
      body={(
        <div className="flex items-center gap-3">
          <PlayToggleButton track={track} className="shrink-0 text-xl !p-2" />
          <div className="flex-1 min-w-0">
            <h2 className="leading-normal truncate">
              <Link href={`${path}${myKey}`}>{title}</Link>
            </h2>
            <div className="flex gap-3 text-sm leading-4">
              <Timestamp timestamp={fileObj.mtime} className="
                shrink-0 !text-sm
                text-date-light dark:text-date-dark
                " />
              <p className="truncate">{fileObj.file}</p>
            </div>
          </div>
          <QueueButtons track={track} className="shrink-0 text-sm mr-2" />
        </div>
      )}
    />
  );
};

export default SongRow;
