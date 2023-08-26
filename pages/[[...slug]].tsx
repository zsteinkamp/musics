import Link from 'next/link'
import { join } from 'path'
import fs from 'fs'
import SongRow from '../components/SongRow'

import { promisify } from 'util';
import { exec } from "child_process";
import { useRef, useState } from 'react'

const pExec = promisify(exec)

type FilesObj = Record<string, any>;

export async function getServerSideProps(context: any) {
  const path = ('/' + ((context && context.params && context.params.slug && context.params.slug) || []).join('/') + '/').replaceAll('//','/');
  const base = `/musics${path}`;
  //                             find files in /musics, sort newest first, only wav files
  const fileCmd = `find "${base}" -maxdepth 1 -printf "%T@ %p\\n" | sort -rn | egrep '(aif|wav|mp3)$' | cut -d ' ' -f 2-`;
  //console.log('PATH', { path, fileCmd });
  const filesStr = (await pExec(fileCmd)).stdout;
  //console.log('FILESTR', { filesStr, base });

  const filesObj:FilesObj = {};

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
      let coverPath:string|null = join(base, prefix) + '.jpg';
      if (! fs.existsSync(coverPath)) {
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

  const dirCmd = `find "${base}" -maxdepth 1 -type d | sort`;
  //console.log('PATH', { path, dirCmd });
  const dirsStr = (await pExec(dirCmd)).stdout;
  const dirs = (dirsStr.split('\n') || []).map((f) => {
    return f.substring(base.length);
  }).filter((e) => e !== '' && e !== null && e !== undefined);
  //console.log('dirs', { dirs, base });

  //console.log(filesObj);

  return {
    props: {
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

export default function Home(props: { filesObj:FilesObj, dirs:string[], path: string }) {
  //console.log({ props });

  const dirList = [...(props.dirs || [])];

  const [activeKey, setActiveKey] = useState(null);
  const audioRefs = useRef({});

  const files = [];
  
  for (const key of Object.keys(props.filesObj)) {
    const fileObj = props.filesObj[key];
    files.push(
      <SongRow
        audioRefs={audioRefs}
        activeKey={activeKey}
        setActiveKey={setActiveKey}
        myKey={key}
        fileObj={fileObj}
        path={props.path}
      />
    );
  }

  if (props.path && props.path.length > 1) {
    dirList.unshift('..');
  }

  const dirs = (dirList || []).map((dir: String, i: Number) => {
    return (
      <div key={i.toString()} className='dir'>
        <Link href={props.path + dir}>{dir === '..' ? '👆 Parent Directory' : dir }</Link>
      </div>
    );
  });
  return (
    <>
      <div className='outer'>
        <div className='dirsContainer'>
          {dirs}
        </div>
        <div className='filesContainer'>
          <h1>MUSICS {props.path}</h1>
          {files}
        </div>
      </div>
    </>
  )
}
