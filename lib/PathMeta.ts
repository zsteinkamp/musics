import { existsSync, readFileSync } from 'fs'
import * as yaml from 'js-yaml'
import { join } from 'path'

export type PathMetaType = Record<string, any>

export function metaForPath(path: string): PathMetaType {
  let albumYMLFilename = join(path, 'album.yml')
  let pathMeta: PathMetaType = {}
  if (existsSync(albumYMLFilename)) {
    pathMeta = yaml.load(readFileSync(albumYMLFilename).toString()) as Record<string, any>
  }
  if (!pathMeta.cover) {
    for (const fname of ['album.jpg', 'cover.jpg']) {
      const candidatePath = join(path, fname)
      //console.log({ candidatePath })
      if (existsSync(candidatePath)) {
        //console.log('FOUND', { candidatePath })
        pathMeta.cover = fname
        break
      }
    }
  }
  return pathMeta
}