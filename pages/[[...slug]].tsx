import Link from 'next/link'
import { join } from 'path'
import fs from 'fs'
import * as yaml from 'js-yaml'
import { promisify } from 'util'
import { exec } from 'child_process'
import { useRef } from 'react'

import SongPage from '@/components/SongPage'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import DirListing from '@/components/DirListing'
import DirLinks from '@/components/DirLinks'
import AboutPage from '@/components/AboutPage'

const pExec = promisify(exec)

export type FilesObj = Record<string, any>

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
  let fileCmd = `find "${base}" -maxdepth 1 -printf "%T@ %p\\n" | sort -rn | egrep '(aif|wav|mp3)$' | cut -d ' ' -f 2-`

  //console.log({ fileCmd })

  let nameArg = ''

  if (!fs.existsSync(base)) {
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
  fileCmd = `find "${base}" ${nameArg} -maxdepth 1 -printf "%T@ %p\\n" | sort -rn | egrep '(aif|wav|mp3)$' | cut -d ' ' -f 2-`

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
    const matches = f.match(/(-\d+)?\.(aif|wav|mp3)$/)
    //console.log({ base, matches, bareFname })
    if (matches && matches.index) {
      const prefix = bareFname.substring(
        0,
        bareFname.length - matches[0].length
      )
      const mtime = fs.statSync(f).mtime.getTime()
      let coverPath: string | null = null
      for (const fname of [prefix + '.jpg', 'album.jpg', 'cover.jpg']) {
        const candidatePath = join(base, fname)
        if (fs.existsSync(candidatePath)) {
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
      filesObj[prefix].children.push({
        file: bareFname,
        mtime,
      })
    }
  }

  let dirs: string[] = []
  let dirMeta: Record<string, any> = {}

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
    //console.log('dirs', { dirs, base });

    let albumYMLFilename = join(base, 'album.yml')
    let albumJPGFilename = join(base, 'album.jpg')
    if (fs.existsSync(albumYMLFilename)) {
      dirMeta = yaml.load(fs.readFileSync(albumYMLFilename).toString()) as Record<string, any>
    }
    if (!dirMeta.cover && fs.existsSync(albumJPGFilename)) {
      dirMeta.cover = albumJPGFilename
    }
  }

  //console.log({ path });

  return {
    props: {
      songPrefix,
      filesObj,
      base,
      dirs, path, dirMeta
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
  dirMeta: Record<string, any>
}

export default function Home({ songPrefix, filesObj, base, dirs, path, dirMeta }: HomeProps) {
  const audioRefs = useRef({})

  //console.log({ base, path, songPrefix, dirs, filesObj });

  return (
    <div className="outer max-w-4xl m-auto p-8">
      <Header path={path} className="" />
      <div className="md:grid md:grid-cols-[1fr_3fr] md:gap-8">
        <DirLinks dirs={dirs} path={path} className={`
          md:max-w-[12rem] ${dirs.length && 'mb-8 py-4'} px-6
          md:bg-gradient-to-l rounded-md
          md:from-shadebg-light md:to-pagebg-light
          md:dark:to-pagebg-dark md:dark:from-shadebg-dark
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
