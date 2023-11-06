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
  const path = join('/', ((context && context.params && context.params.slug && context.params.slug.join('/')) || ''))
  let base = join('/musics', path);
  let songPrefix = ''

  if (!fs.existsSync(base)) {
    base = base.replace(/\/[^/]*$/, '')
    const matches = path.match(/\/([^/]*)$/)
    if (matches && matches[0]) {
      songPrefix = matches[0]
    }
  }

  //console.log({base});
  //                             find files in /musics, sort newest first, only wav files
  const fileCmd = `find "${base}" -maxdepth 1 -printf "%T@ %p\\n" | sort -rn | egrep '(aif|wav|mp3)$' | cut -d ' ' -f 2-`;
  //console.log('PATH', { path, fileCmd });
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
    if (matches && matches.index) {
      const prefix = bareFname.substring(0, matches.index - base.length);
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
    content = (
      <>
        <h1>MUSICS {path}</h1>
        {Object.keys(filesObj).map((key) => {
          const fileObj = filesObj[key];
          return (
            <SongRow
              key={key}
              audioRefs={audioRefs}
              activeKey={activeKey}
              setActiveKey={setActiveKey}
              myKey={key}
              fileObj={fileObj}
              path={path}
            />
          );
        })}
      </>
    )
  }

  if (path && path.length > 1) {
    dirList.unshift('..');
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
