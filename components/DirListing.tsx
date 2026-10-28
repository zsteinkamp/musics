import { FilesObj } from '@/pages/[[...slug]]';
import { join } from 'path'
import SongRow from './SongRow';
import type { PathMetaType } from '@/lib/PathMeta';
import type { FileMetaType } from '@/pages/[[...slug]]'
import CoverImage from './CoverImage';
import Markdown from 'react-markdown';
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

  const filesArr = Object.values(filesObj)

  if (dirMeta.sort === 'newest') {
    filesArr.sort((a: FileMetaType, b: FileMetaType) => {
      return b.mtime - a.mtime
    })
  } else if (dirMeta.sort === 'oldest') {
    filesArr.sort((a: FileMetaType, b: FileMetaType) => {
      return a.mtime - b.mtime
    })
  } else {
    // default to alpha
    filesArr.sort((a: FileMetaType, b: FileMetaType) => {
      return a.file.toLowerCase() > b.file.toLowerCase() ? 1 : -1
    })
  }
  let filesObjKeys = filesArr.map((e) => e.file.replace(/(-\d+)?.(wav|aif|mp3|m4a|flac)$/, ""))

  if (dirMeta.tracks) {
    filesObjKeys = []
    for (const t of dirMeta.tracks) {
      if (filesObj[t.prefix]) {
        filesObj[t.prefix].title = t.title
        filesObjKeys.push(t.prefix)
      } else {
        console.error(`Invalid track prefix [${t.prefix}]. Skipping.`)
      }
    }
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
