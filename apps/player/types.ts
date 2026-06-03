export type MediaKind = 'audio' | 'video'

export type MediaInfo = {
  kind: MediaKind
  mime: string
}

export type PlaylistItem = {
  root: LocalCloud.FileSystemRoot
  path: string
  media: MediaInfo
}

export type SavedPlaylist = {
  id: string
  name: string
  items: PlaylistItem[]
  createdAt: string
  updatedAt: string
}

export type PlaybackSource =
  | { kind: 'file' }
  | { kind: 'folder'; name: string }
  | { kind: 'playlist'; name: string }

export type PlayerState =
  | { status: 'idle'; title: string; message: string }
  | { status: 'loading'; item: PlaylistItem }
  | { status: 'ready'; item: PlaylistItem; source: string }
  | { status: 'error'; item: PlaylistItem | null; title: string; message: string }
