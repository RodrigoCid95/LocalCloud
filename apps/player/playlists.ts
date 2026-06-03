import type { SavedPlaylist } from './types'

const playlistsKey = 'playlists'

const isSavedPlaylist = (value: unknown): value is SavedPlaylist => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const playlist = value as Partial<SavedPlaylist>
  return (
    typeof playlist.id === 'string'
    && typeof playlist.name === 'string'
    && Array.isArray(playlist.items)
    && typeof playlist.createdAt === 'string'
    && typeof playlist.updatedAt === 'string'
  )
}

export const loadPlaylists = async () => {
  const value = await window.sdk.data.user.get(playlistsKey)
  return Array.isArray(value) ? value.filter(isSavedPlaylist) : []
}

export const savePlaylists = async (playlists: SavedPlaylist[]) => {
  await window.sdk.data.user.set(playlistsKey, playlists)
}

export const createPlaylistId = () => (
  `${Date.now()}-${Math.random().toString(36).slice(2)}`
)
