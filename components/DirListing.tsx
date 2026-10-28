import { FilesObj } from '@/pages/[[...slug]]';
import { join } from 'path'
import SongRow from './SongRow';
import type { PathMetaType } from '@/lib/PathMeta';
import type { FileMetaType } from '@/pages/[[...slug]]'
import CoverImage from './CoverImage';
import Markdown from 'react-markdown';
import { useState } from 'react';
import { usePlayer, Track } from '@/lib/player';
import { primaryButton, secondaryButton } from './TrackControls';
import { AddToQueueIcon, PlayIcon, PlayNextIcon } from './Icons';

type AlbumControlsProps = {
  tracks: Track[]
  label: string
  className?: string
}

// album-level play / queue controls; playing an album continues through its tracks
const AlbumControls = ({ tracks, label, className = "" }: AlbumControlsProps) => {
  const { playAll, enqueue } = usePlayer()
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <button className={`${primaryButton} pl-5 pr-6 py-2 text-lg font-bold`} onClick={() => playAll(tracks)}>
        <PlayIcon /> {label}
      </button>
      <button className={`${secondaryButton} p-2.5 text-lg`} title='Play all next'
        aria-label='Play all next' onClick={() => enqueue(tracks, 'next')}>
        <PlayNextIcon />
      </button>
      <button className={`${secondaryButton} p-2.5 text-lg`} title='Add all to queue'
        aria-label='Add all to queue' onClick={() => enqueue(tracks, 'end')}>
        <AddToQueueIcon />
      </button>
    </div>
  )
}

type SortMode = 'album' | 'name' | 'newest' | 'oldest'
const SORT_MODES: SortMode[] = ['name', 'newest', 'oldest']
const SORT_LABELS: Record<SortMode, string> = {
  album: 'Album order',
  name: 'Name',
  newest: 'Newest',
  oldest: 'Oldest',
}

type DirListingProps = {
  path: string
  dirMeta: PathMetaType
  filesObj: FilesObj
  base: string
  className?: string
};

const DirListing = ({
  path,
  dirMeta = {},
  filesObj,
  base,
  className = "",
}: DirListingProps): JSX.Element | null => {

  // album.yml `tracks` defines both the track order and which files are shown
  let albumKeys: string[] | null = null
  if (dirMeta.tracks) {
    albumKeys = []
    for (const t of dirMeta.tracks) {
      if (filesObj[t.prefix]) {
        filesObj[t.prefix].title = t.title
        albumKeys.push(t.prefix)
      } else {
        console.error(`Invalid track prefix [${t.prefix}]. Skipping.`)
      }
    }
  }

  // album.yml `sort` (or track order) picks the initial sort; the viewer can change it
  const sortModes: SortMode[] = albumKeys ? ['album', ...SORT_MODES] : SORT_MODES
  const defaultSort: SortMode = albumKeys ? 'album' : SORT_MODES.includes(dirMeta.sort) ? dirMeta.sort : 'name'
  const [sort, setSort] = useState<SortMode>(defaultSort)

  let filesObjKeys: string[]
  if (sort === 'album' && albumKeys) {
    filesObjKeys = albumKeys
  } else {
    const filesArr = Object.entries(filesObj)
      .filter(([key]) => !albumKeys || albumKeys.includes(key))
    if (sort === 'newest') {
      filesArr.sort(([, a]: [string, FileMetaType], [, b]: [string, FileMetaType]) => b.mtime - a.mtime)
    } else if (sort === 'oldest') {
      filesArr.sort(([, a]: [string, FileMetaType], [, b]: [string, FileMetaType]) => a.mtime - b.mtime)
    } else {
      filesArr.sort(([ka, a]: [string, FileMetaType], [kb, b]: [string, FileMetaType]) =>
        (a.title || ka).toLowerCase() > (b.title || kb).toLowerCase() ? 1 : -1)
    }
    filesObjKeys = filesArr.map(([key]) => key)
  }
  const albumName = dirMeta.title || path.split('/').filter((e) => !!e).pop() || ''
  const tracks: Track[] = filesObjKeys.map((key) => {
    const fileObj = filesObj[key]
    return {
      src: `/api/musics${path + fileObj.file}`,
      title: fileObj.title || key,
      href: `${path}${key}`,
      cover: fileObj.coverPath || (dirMeta.cover ? join(base, dirMeta.cover) : undefined),
      album: albumName,
    }
  })

  return (
    <div className={`${className}`}>
      {dirMeta.cover && <CoverImage title={dirMeta.title || dirMeta.cover} src={join(base, dirMeta.cover)} className="mb-8" />
      }
      {dirMeta.title && <h1 className="mb-4">{dirMeta.title}</h1>}
      {tracks.length > 0 && <AlbumControls tracks={tracks} label={dirMeta.title ? 'Play album' : 'Play all'} className="mb-8" />}
      {dirMeta.description && <div className="text-base mb-8 album-description"><Markdown>{dirMeta.description}</Markdown></div>}
      {tracks.length > 1 && (
        <div className="flex justify-end mb-4">
          <div role="group" aria-label="Sort tracks" className="inline-flex rounded-full p-1 text-sm
            bg-shadebg-light dark:bg-shadebg-dark">
            {sortModes.map((mode) => (
              <button key={mode} aria-pressed={sort === mode} onClick={() => setSort(mode)}
                className={`px-3 py-0.5 rounded-full font-header transition-colors ${sort === mode
                  ? 'text-white bg-link-base-light dark:bg-link-base-dark'
                  : 'text-headertext-light dark:text-headertext-dark hover:text-link-hover-light hover:dark:text-link-hover-dark'}`}>
                {SORT_LABELS[mode]}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="grid grod-cols-1 gap-4">
        {
          filesObjKeys.map((key, idx) => {
            //console.log({ path, key })
            return (
              <SongRow
                key={key}
                track={tracks[idx]}
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
