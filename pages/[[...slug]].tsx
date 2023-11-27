import Link from 'next/link'
import { join } from 'path'
import fs from 'fs'
import SongRow from '../components/SongRow'
import SongPage from '../components/SongPage'

import { promisify } from 'util';
import { exec } from "child_process";
import { useRef, useState } from 'react'

const pExec = promisify(exec)

type FilesObj = Record<string, any>;

export async function getServerSideProps(context: any) {
  //console.log({ params: context.params })
  let path = join('/', ((context && context.params && context.params.slug && context.params.slug.join('/') + (context.params.slug.length > 0 ? '/' : '')) || ''))
  const root = '/musics'
  let base = join(root, path);
  let songPrefix = ''

  //console.log({ base, root, path })
  let fileCmd = `find "${base}" -maxdepth 1 -printf "%T@ %p\\n" | sort -rn | egrep '(aif|wav|mp3)$' | cut -d ' ' -f 2-`;

  if (!fs.existsSync(base)) {
    //console.log({ dir: 'A FILE' })
    // this is a file
    base = base.replace(/[^/]+\/$/, '')
    const matches = path.match(/\/([^/]+)\/$/)
    if (matches && matches[1]) {
      songPrefix = matches[1]
    }
    path = path.replace(/\/[^/]*\/$/, '/')
    fileCmd = `find "${base}" -name '${songPrefix}*' -maxdepth 1 -printf "%T@ %p\\n" | sort -rn | egrep '(aif|wav|mp3)$' | cut -d ' ' -f 2-`;
    //console.log({ after: true, base, root, path, songPrefix })
  } else {
    //console.log({ dir: 'A DIRECTORY!' })
  }

  //console.log({ base });
  //                             find files in /musics, sort newest first, only wav files
  //console.log({ base, path, songPrefix, fileCmd });
  const filesStr = (await pExec(fileCmd)).stdout;
  //console.log('FILESTR', { filesStr, base });

  const filesObj: FilesObj = {};

  const files = (filesStr.split('\n') || []);

  for (const f of files) {
    if (!f) {
      continue;
    }
    const bareFname = f.substring(base.length);
    const matches = f.match(/-\d+\.wav$/);
    //console.log({ base, matches, bareFname })
    if (matches && matches.index) {
      const prefix = bareFname.substring(0, bareFname.length - matches[0].length)
      const mtime = fs.statSync(f).mtime.getTime();
      let coverPath: string | null = join(base, prefix) + '.jpg';
      if (!fs.existsSync(coverPath)) {
        coverPath = null;
      }

      if (!filesObj[prefix]) {
        filesObj[prefix] = {
          file: bareFname,
          mtime,
          coverPath,
          children: []
        }
      }
      filesObj[prefix].children.push({
        file: bareFname,
        mtime
      })
    }
  }

  let dirs: string[] = []
  let songMeta: Record<string, any> = {}

  if (!songPrefix) {
    const dirCmd = `find "${base}" -maxdepth 1 -type d | sort`;
    //console.log('PATH', { path, dirCmd });
    const dirsStr = (await pExec(dirCmd)).stdout;
    dirs = (dirsStr.split('\n') || []).map((f) => {
      return f.substring(base.length);
    }).filter((e) => e !== '' && e !== null && e !== undefined);
    //console.log('dirs', { dirs, base });
  }

  //console.log(filesObj);

  return {
    props: {
      songPrefix,
      filesObj: filesObj,
      dirs: dirs,
      path: path
    }, // will be passed to the page component as props
  }
}

export async function getServerSidePaths() {
  return {
    paths: [],
    fallback: true
  };
}

type HomeProps = {
  songPrefix: string,
  filesObj: FilesObj,
  dirs: string[],
  path: string
}

export default function Home({ songPrefix, filesObj, dirs, path }: HomeProps) {
  //console.log({ path, songPrefix });

  const dirList = [...(dirs || [])];

  const [activeKey, setActiveKey] = useState(null);
  const audioRefs = useRef({});

  let content = null;

  if (songPrefix) {
    content = (
      <SongPage filesObj={filesObj} path={path} songPrefix={songPrefix} />
    )
  } else {
    let pathLinks = []
    if (path !== '/') {
      const pathParts = path.substring(1).split('/').filter((e) => !!e)
      let pathAccum = ''
      let newAccum = ''
      for (const pathPart of pathParts) {
        pathLinks.push(<span key={`s${pathPart}`}>/</span>)
        newAccum = `${pathAccum}/${pathPart}`
        pathLinks.push(
          <em key={`e${pathPart}`}><Link href={newAccum}>{pathPart}</Link></em>
        )
        pathAccum = newAccum
      }
    }
    content = (
      <>
        <h1><Link href="/">MUSICS</Link>{pathLinks}</h1>
        {Object.keys(filesObj).map((key) => {
          //console.log({ path, key })
          return (
            <SongRow
              key={key}
              audioRefs={audioRefs}
              activeKey={activeKey}
              setActiveKey={setActiveKey}
              myKey={key}
              fileObj={filesObj[key]}
              path={path}
            />
          );
        })}
      </>
    )
  }

  if (path && path.length > 1) {
    //dirList.unshift('..');
  }

  const dirLinks = (dirList || []).map((dir: string, i: number) => {
    return (
      <div key={i.toString()} className='dir'>
        <Link href={join(path, dir)}>{dir === '..' ? '👆 Parent Directory' : dir}</Link>
      </div>
    );
  });
  return (
    <>
      <div className='outer'>
        <div className='dirsContainer'>
          {dirLinks}
        </div>
        <div className='filesContainer'>
          {content}
        </div>
      </div>
    </>
  )
}
