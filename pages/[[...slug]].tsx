import Link from 'next/link'
import { join } from 'path'
import fs from 'fs'
import * as yaml from 'js-yaml'
import { promisify } from 'util'
import { exec } from 'child_process'
import { useRef, useState } from 'react'

import SongRow from '../components/SongRow'
import SongPage from '../components/SongPage'

const pExec = promisify(exec)

type FilesObj = Record<string, any>

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

  if (!fs.existsSync(base)) {
    //console.log({ dir: 'A FILE' })
    // this is a file
    base = base.replace(/[^/]+\/$/, '')
    const matches = path.match(/\/([^/]+)\/$/)
    if (matches && matches[1]) {
      songPrefix = matches[1]
    }
    path = path.replace(/\/[^/]*\/$/, '/')
    // fileCmd will give the versions of the given songPrefix, sorted by descending date
    fileCmd = `find "${base}" -name '${songPrefix}*' -maxdepth 1 -printf "%T@ %p\\n" | sort -rn | egrep '(aif|wav|mp3)$' | cut -d ' ' -f 2-`
    //console.log({ after: true, base, root, path, songPrefix })
    //} else {
    //  console.log({ dir: 'A DIRECTORY!' })
  }

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
    const matches = f.match(/-\d+\.(aif|wav|mp3)$/)
    //console.log({ base, matches, bareFname })
    if (matches && matches.index) {
      const prefix = bareFname.substring(
        0,
        bareFname.length - matches[0].length
      )
      const mtime = fs.statSync(f).mtime.getTime()
      let coverPath: string | null = join(base, prefix) + '.jpg'
      if (!fs.existsSync(coverPath)) {
        coverPath = null
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
    if (fs.existsSync(albumYMLFilename)) {
      dirMeta = yaml.load(fs.readFileSync(albumYMLFilename).toString()) as Record<string, any>
    }
  }

  //console.log(filesObj);

  return {
    props: {
      songPrefix,
      filesObj,
      base,
      dirs,
      path,
      dirMeta
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
  //console.log({ base, path, songPrefix, dirs });

  const dirList = [...(dirs || [])]

  const [activeKey, setActiveKey] = useState(null)
  const audioRefs = useRef({})

  let content = null

  if (songPrefix) {
    content = (
      <SongPage filesObj={filesObj} path={path} songPrefix={songPrefix} />
    )
  } else {
    let pathLinks = []
    if (path !== '/') {
      const pathParts = path
        .substring(1)
        .split('/')
        .filter((e) => !!e)
      let pathAccum = ''
      let newAccum = ''
      for (const pathPart of pathParts) {
        pathLinks.push(<span key={`s${pathPart}`}>/</span>)
        newAccum = `${pathAccum}/${pathPart}`
        pathLinks.push(
          <em key={`e${pathPart}`}>
            <Link href={newAccum}>{pathPart}</Link>
          </em>
        )
        pathAccum = newAccum
      }
    }
    let filesObjKeys = Object.keys(filesObj)
    if (dirMeta.tracks) {
      filesObjKeys = []
      for (const t of dirMeta.tracks) {
        if (filesObj[t.prefix]) {
          filesObjKeys.push(t.prefix)
          filesObj[t.prefix].title = t.title
          //console.info(`Pushed prefix ${t.prefix}.`)
        } else {
          console.error(`Invalid track prefix [${t.prefix}]. Skipping.`)
        }
      }
    }
    content = (
      <>
        <h1>
          <Link href="/">MUSICS</Link>
          {pathLinks}
        </h1>
        {dirMeta.cover && <div className="cover outerCover"><img alt={dirMeta.title || dirMeta.cover} src={join(base, dirMeta.cover)} /></div>}
        {dirMeta.title && <h2 className="">{dirMeta.title}</h2>}
        {dirMeta.description && <p className="">{dirMeta.description}</p>}
        {
          filesObjKeys.map((key, idx) => {
            //console.log({ path, key })
            return (
              <div className="">
                <SongRow
                  key={key}
                  audioRefs={audioRefs}
                  activeKey={activeKey}
                  nextKey={idx < filesObjKeys.length - 1 ? filesObjKeys[idx + 1] : null}
                  setActiveKey={setActiveKey}
                  myKey={key}
                  showCover={!dirMeta.cover}
                  fileObj={filesObj[key]}
                  path={path}
                />
              </div>
            )
          })
        }
      </>
    )
  }

  if (path && path.length > 1) {
    //dirList.unshift('..');
  }

  const dirLinks = (dirList || []).map((dir: string, i: number) => {
    return (
      <div key={i.toString()} className="dir">
        <Link href={join(path, dir)}>
          {dir === '..' ? '👆 Parent Directory' : dir}&nbsp;/
        </Link>
      </div>
    )
  })
  return (
    <>
      <div className="outer">
        <div className="dirsContainer">{dirLinks}</div>
        <div className={`filesContainer ${dirMeta.cover && "albumPage"}`}>{content}</div>
        <div className="rightPad" />
      </div>
    </>
  )
}
