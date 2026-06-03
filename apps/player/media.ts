import type { MediaInfo, PlaylistItem } from './types'

const mediaTypes: Record<string, MediaInfo> = {
  mp3: { kind: 'audio', mime: 'audio/mpeg' },
  m4a: { kind: 'audio', mime: 'audio/mp4' },
  aac: { kind: 'audio', mime: 'audio/aac' },
  wav: { kind: 'audio', mime: 'audio/wav' },
  flac: { kind: 'audio', mime: 'audio/flac' },
  ogg: { kind: 'audio', mime: 'audio/ogg' },
  oga: { kind: 'audio', mime: 'audio/ogg' },
  opus: { kind: 'audio', mime: 'audio/ogg; codecs=opus' },
  weba: { kind: 'audio', mime: 'audio/webm' },
  mp4: { kind: 'video', mime: 'video/mp4' },
  m4v: { kind: 'video', mime: 'video/mp4' },
  webm: { kind: 'video', mime: 'video/webm' },
  ogv: { kind: 'video', mime: 'video/ogg' },
  mov: { kind: 'video', mime: 'video/quicktime' },
}

export const isFileSystemRoot = (value: string | null): value is LocalCloud.FileSystemRoot => (
  value === 'shared' || value === 'user'
)

export const getFileName = (path: string) => {
  const segments = path.split('/').filter(Boolean)
  return segments.length > 0 ? segments[segments.length - 1] : path
}

export const joinPath = (basePath: string, name: string) => (
  [basePath, name].filter(Boolean).join('/')
)

export const getParentPath = (path: string) => {
  const segments = path.split('/').filter(Boolean)
  return segments.slice(0, -1).join('/')
}

export const getExtension = (path: string) => {
  const fileName = getFileName(path)
  const index = fileName.lastIndexOf('.')
  return index >= 0 ? fileName.slice(index + 1).toLowerCase() : ''
}

export const getMediaInfo = (path: string) => mediaTypes[getExtension(path)]

export const getRequestItem = (): PlaylistItem | null => {
  const params = new URLSearchParams(window.location.search)
  const root = params.get('root')
  const path = params.get('path') || ''

  if (!isFileSystemRoot(root) || !path) {
    return null
  }

  const media = getMediaInfo(path)
  if (!media) {
    return null
  }

  return { root, path, media }
}

export const getSupportedFiles = (
  root: LocalCloud.FileSystemRoot,
  path: string,
  entries: LocalCloud.FileSystemEntry[],
): PlaylistItem[] => (
  entries
    .filter(entry => entry.type === 'file')
    .map(entry => {
      const itemPath = joinPath(path, entry.name)
      const media = getMediaInfo(itemPath)
      return media ? { root, path: itemPath, media } : null
    })
    .filter((item): item is PlaylistItem => item !== null)
)
