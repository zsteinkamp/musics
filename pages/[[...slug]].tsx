import { join } from 'path'
import { existsSync, statSync } from 'fs'
import { promisify } from 'util'
import { exec } from 'child_process'
import { useRef } from 'react'

import SongPage from '@/components/SongPage'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import DirListing from '@/components/DirListing'
import DirLinks from '@/components/DirLinks'
import AboutPage from '@/components/AboutPage'
import { PathMetaType, metaForPath } from '@/lib/PathMeta'

const pExec = promisify(exec)

export type FileVersionMetaType = {
  file: string
  mtime: number
}

export type FileMetaType = {
  file: string
  mtime: number
  coverPath?: string
  children?: FileVersionMetaType[]
}
export type FilesObj = Record<string, FileMetaType>

export async function getServerSideProps(context: any) {
  //console.log({ params: context.params })
  let path = join(
    '/',
    (context &&
      context.params &&
      context.params.slug &&
      context.params.slug.join('/') +
      (context.params.slug.length > 0 ? '/' : '')) ||
    ''
  )
  const root = '/musics'
  // base is a string pointing to the filesystem path corresponding to the requested URL path
  let base = join(root, path)
  // songPrefix is the part of the filename prior to the -NN.wav suffix.
  let songPrefix = ''

  //console.log({ base, root, path })
  // get audio files in the current directory (path = directory is the base case)
  let fileCmd = `find "${base}" -maxdepth 1 -printf "%T@ %p\\n" | sort -rn | egrep '(aif|wav|mp3|m4a)$' | cut -d ' ' -f 2-`

  //console.log({ fileCmd })

  let nameArg = ''

  if (!existsSync(base)) {
    //console.log({ dir: 'A FILE' })
    // this is a file
    base = base.replace(/[^/]+\/$/, '')
    const matches = path.match(/\/([^/]+)\/$/)
    if (matches && matches[1]) {
      songPrefix = matches[1]
    }
    nameArg = `-name '${songPrefix}*'`
    //console.log({ after: true, base, root, path, songPrefix })
    //} else {
    //console.log({ dir: 'A DIRECTORY!' })
  }

  // fileCmd will give the versions of the given songPrefix, sorted by descending date
  fileCmd = `find "${base}" ${nameArg} -maxdepth 1 -printf "%T@ %p\\n" | sort -rn | egrep '(aif|wav|mp3|m4a)$' | cut -d ' ' -f 2-`

  //console.log({ base, path, songPrefix, fileCmd });
  // run the fileCmd and get the output (newline separated)
  const filesStr = (await pExec(fileCmd)).stdout
  //console.log('FILESTR', { filesStr, base });

  const filesObj: FilesObj = {}

  const files = filesStr.split('\n') || []

  for (const f of files) {
    if (!f) {
      continue
    }
    const bareFname = f.substring(base.length)
    const matches = f.match(/(-\d+)?\.(aif|wav|mp3|m4a)$/)
    //console.log({ base, matches, bareFname })
    if (matches && matches.index) {
      const prefix = bareFname.substring(
        0,
        bareFname.length - matches[0].length
      )
      const mtime = statSync(f).mtime.getTime()
      let coverPath: string = ""
      for (const fname of [prefix + '.jpg', 'album.jpg', 'cover.jpg']) {
        const candidatePath = join(base, fname)
        if (existsSync(candidatePath)) {
          coverPath = candidatePath
          break
        }
      }

      if (!filesObj[prefix]) {
        // initial creation of filesObj[prefix]
        filesObj[prefix] = {
          file: bareFname,
          mtime,
          coverPath,
          children: [],
        }
      }
      // push song version onto children[]
      filesObj[prefix]?.children?.push({
        file: bareFname,
        mtime,
      })
    }
  }

  let dirs: string[] = []
  let dirMeta: PathMetaType = {}
  const subdirMeta: PathMetaType = {}

  if (!songPrefix) {
    // looking at a directory, so look for subdirectories
    const dirCmd = `find "${base}" -maxdepth 1 -type d | sort`
    //console.log('PATH', { path, dirCmd });
    const dirsStr = (await pExec(dirCmd)).stdout
    dirs = (dirsStr.split('\n') || [])
      .map((f) => {
        return f.substring(base.length)
      })
      .filter((e) => e !== '' && e !== null && e !== undefined)

    dirMeta = metaForPath(base)
    for (const dir of dirs) {
      subdirMeta[dir] = metaForPath(join(base, dir))
    }
  }

  //console.log({ path, dirMeta });

  return {
    props: {
      songPrefix,
      filesObj,
      base,
      dirs, path, dirMeta, subdirMeta
    }, // will be passed to the page component as props
  }
}

export async function getServerSidePaths() {
  return {
    paths: [],
    fallback: true,
  }
}

type HomeProps = {
  songPrefix: string
  filesObj: FilesObj
  base: string
  dirs: string[]
  path: string
  dirMeta: PathMetaType
  subdirMeta: Record<string, PathMetaType>
}

export default function Home({ songPrefix, filesObj, base, dirs, path, dirMeta, subdirMeta }: HomeProps) {
  const audioRefs = useRef({})

  //console.log({ base, path, songPrefix, dirs, filesObj });

  return (
    <div className="outer max-w-4xl m-auto p-8">
      <Header path={path} className="" />
      <div className="">
        <DirLinks dirs={dirs} subdirMeta={subdirMeta} path={path} className={`
          ${dirs.length && 'mb-8 py-4'} px-0
          `} />
        {path.startsWith('/about') ? (<AboutPage />) :
          songPrefix ? (
            <SongPage filesObj={filesObj} path={path} songPrefix={songPrefix} />
          ) : (
            <DirListing path={path} dirMeta={dirMeta}
              filesObj={filesObj} base={base} audioRefs={audioRefs} />
          )}
      </div>
      <Footer />
    </div>
  )
}
