import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { Inter } from 'next/font/google'
import { readdirSync } from 'fs'
import { join } from 'path'

import { promisify } from 'util';
import { exec } from "child_process";

const pExec = promisify(exec)

const inter = Inter({ subsets: ['latin'] })

export async function getStaticProps(context) {
  const path = ('/' + ((context && context.params && context.params.slug && context.params.slug) || []).join('/') + '/').replaceAll('//','/');
  const base = `/musics${path}`;
  //                             find files in /musics, sort newest first, only wav files
  const fileCmd = `find "${base}" -maxdepth 1 -printf "%T@ %p\\n" | sort -rn | egrep '(aif|wav|mp3)$' | cut -d ' ' -f 2-`;
  console.log('PATH', { path, fileCmd });
  const filesStr = (await pExec(fileCmd)).stdout;
  console.log('FILESTR', { filesStr, base });
  const files = (filesStr.split('\n') || []).map((f) => {
    return f.substr(base.length);
  }).filter((e) => e !== '' && e !== null && e !== undefined);

  const dirCmd = `find "${base}" -maxdepth 1 -type d | sort`;
  console.log('PATH', { path, dirCmd });
  const dirsStr = (await pExec(dirCmd)).stdout;
  const dirs = (dirsStr.split('\n') || []).map((f) => {
    return f.substr(base.length);
  }).filter((e) => e !== '' && e !== null && e !== undefined);
  console.log('dirs', { dirs, base });

  return {
    props: {
      files: files,
      dirs: dirs,
      path: path
    }, // will be passed to the page component as props
  }
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true
  }
}

export default function Home(props) {
  console.log({ props });

  const dirList = [...(props.dirs || [])];

  const files = (props.files || []).map((fname, i) => {
    return (
      <div key={i} className='song'>
        <div><audio preload="none" controls src={`/api/musics${props.path + fname}`} /></div>
        <div><p>{fname}</p></div>
      </div>
    );
  });

  if (props.path && props.path.length > 1) {
    dirList.unshift('..');
  }

  const dirs = (dirList || []).map((dir, i) => {
    return (
      <div key={i} className='dir'>
        <Link href={props.path + dir}>{dir === '..' ? '👆 Parent Directory' : dir }</Link>
      </div>
    );
  });
  return (
    <>
      <h1>MUSICS {props.path}</h1>
      <div className='outer'>
        <div className='dirsContainer'>
          {dirs}
        </div>
        <div className='filesContainer'>
          {files}
        </div>
      </div>
    </>
  )
}
