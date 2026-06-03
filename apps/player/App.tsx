import { StrictMode, Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Badge,
  Button,
  Caption1,
  FluentProvider,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Slider,
  Spinner,
  Subtitle2,
  Title2,
  Tooltip,
  webDarkTheme,
  webLightTheme,
} from '@fluentui/react-components'
import {
  DismissRegular,
  FolderOpenRegular,
  FullScreenMaximizeRegular,
  NextRegular,
  PauseRegular,
  PlayRegular,
  PreviousRegular,
  Speaker2Regular,
  SpeakerMuteRegular,
} from '@fluentui/react-icons'

import './main.css'
import { getFileName, getParentPath, getRequestItem } from './media'
import { useStyles } from './styles'
import type { PlaybackSource, PlayerState, PlaylistItem } from './types'

const FolderDialog = lazy(() => import('./components/FolderDialog'))
const PlaylistLibrary = lazy(() => import('./components/PlaylistLibrary'))
const PlaylistPanel = lazy(() => import('./components/PlaylistPanel'))

const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
const playerSessionKey = 'localcloud.player.session'

type StoredPlayerSession = {
  playlist: PlaylistItem[]
  currentIndex: number
  currentTime: number
  isPlaying: boolean
  playbackSource: PlaybackSource
}

const isPlaylistItem = (value: unknown): value is PlaylistItem => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const item = value as Partial<PlaylistItem>
  return (
    (item.root === 'shared' || item.root === 'user') &&
    typeof item.path === 'string' &&
    !!item.media &&
    (item.media.kind === 'audio' || item.media.kind === 'video') &&
    typeof item.media.mime === 'string'
  )
}

const isPlaybackSource = (value: unknown): value is PlaybackSource => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const source = value as Partial<PlaybackSource>
  if (source.kind === 'file') {
    return true
  }

  return (
    (source.kind === 'folder' || source.kind === 'playlist') &&
    typeof source.name === 'string'
  )
}

const inferPlaybackSource = (playlist: PlaylistItem[]): PlaybackSource => (
  playlist.length > 1 ? { kind: 'folder', name: 'Carpeta' } : { kind: 'file' }
)

const clearRequestUrl = () => {
  const url = new URL(window.location.href)
  if (!url.search) {
    return
  }

  url.search = ''
  window.history.replaceState(window.history.state, '', url)
}

const loadStoredSession = (): StoredPlayerSession | null => {
  try {
    const rawSession = window.localStorage.getItem(playerSessionKey)
    if (!rawSession) {
      return null
    }

    const session = JSON.parse(rawSession) as Partial<StoredPlayerSession>
    if (
      !Array.isArray(session.playlist) ||
      session.playlist.length === 0 ||
      !session.playlist.every(isPlaylistItem)
    ) {
      return null
    }

    const currentIndex = typeof session.currentIndex === 'number'
      ? Math.min(Math.max(Math.trunc(session.currentIndex), 0), session.playlist.length - 1)
      : 0
    const currentTime = typeof session.currentTime === 'number' && Number.isFinite(session.currentTime)
      ? Math.max(session.currentTime, 0)
      : 0

    return {
      playlist: session.playlist,
      currentIndex,
      currentTime,
      isPlaying: session.isPlaying !== false,
      playbackSource: isPlaybackSource(session.playbackSource)
        ? session.playbackSource
        : inferPlaybackSource(session.playlist),
    }
  } catch (reason) {
    console.error(reason)
    return null
  }
}

const saveStoredSession = (session: StoredPlayerSession) => {
  try {
    window.localStorage.setItem(playerSessionKey, JSON.stringify(session))
  } catch (reason) {
    console.error(reason)
  }
}

const clearStoredSession = () => {
  try {
    window.localStorage.removeItem(playerSessionKey)
  } catch (reason) {
    console.error(reason)
  }
}

const formatTime = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    return '0:00'
  }

  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
}

const PlayerContent = () => {
  const styles = useStyles()
  const mediaRef = useRef<HTMLMediaElement | null>(null)
  const requestItemRef = useRef<PlaylistItem | null>(getRequestItem())
  const storedSessionRef = useRef<StoredPlayerSession | null>(
    requestItemRef.current ? null : loadStoredSession(),
  )
  const resumeTimeRef = useRef(storedSessionRef.current?.currentTime || 0)
  const resumePlaybackRef = useRef(storedSessionRef.current?.isPlaying ?? true)
  const [theme, setTheme] = useState(darkModeQuery.matches ? webDarkTheme : webLightTheme)
  const [playlist, setPlaylist] = useState<PlaylistItem[]>(() => {
    if (requestItemRef.current) {
      return [requestItemRef.current]
    }

    return storedSessionRef.current?.playlist || []
  })
  const [currentIndex, setCurrentIndex] = useState(() => storedSessionRef.current?.currentIndex || 0)
  const [playbackSource, setPlaybackSource] = useState<PlaybackSource>(() => {
    if (requestItemRef.current) {
      return { kind: 'file' }
    }

    return storedSessionRef.current?.playbackSource || { kind: 'file' }
  })
  const [state, setState] = useState<PlayerState>(() => {
    const initialItem = requestItemRef.current || storedSessionRef.current?.playlist[storedSessionRef.current.currentIndex]
    return initialItem
      ? { status: 'loading', item: initialItem }
      : {
        status: 'idle',
        title: 'Sin archivo',
        message: 'Abre un archivo de audio o video desde Archivos, o selecciona una carpeta.',
      }
  })
  const [folderDialogOpen, setFolderDialogOpen] = useState(false)
  const [playlistLibraryOpen, setPlaylistLibraryOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(() => storedSessionRef.current?.currentTime || 0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.85)
  const [muted, setMuted] = useState(false)

  const currentItem = playlist[currentIndex] || null
  const folderInitialRoot = currentItem?.root || 'user'
  const folderInitialPath = currentItem ? getParentPath(currentItem.path) : ''
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex + 1 < playlist.length
  const hasPlaybackQueue = playlist.length > 1
  const playbackSourceLabel = playbackSource.kind === 'file'
    ? 'Archivo'
    : playbackSource.kind === 'folder'
      ? 'Carpeta'
      : 'Lista'
  const playbackSourceTitle = playbackSource.kind === 'file'
    ? ''
    : playbackSource.name

  const fileName = useMemo(() => {
    if (state.status === 'idle') {
      return 'Reproductor'
    }

    if (state.status === 'error') {
      return state.item ? getFileName(state.item.path) : 'Reproductor'
    }

    return getFileName(state.item.path)
  }, [state])

  const playItems = useCallback((items: PlaylistItem[], startIndex = 0, source: PlaybackSource = { kind: 'folder', name: 'Carpeta' }) => {
    resumeTimeRef.current = 0
    resumePlaybackRef.current = true
    clearRequestUrl()

    if (items.length === 0) {
      setPlaylist([])
      setCurrentIndex(0)
      setPlaybackSource(source)
      setState({
        status: 'idle',
        title: source.kind === 'playlist' ? 'Lista sin archivos reproducibles' : 'Carpeta sin archivos reproducibles',
        message: source.kind === 'playlist'
          ? 'La lista seleccionada no tiene archivos con formatos soportados.'
          : 'La carpeta seleccionada no tiene archivos con formatos soportados.',
      })
      return
    }

    setPlaylist(items)
    setCurrentIndex(startIndex)
    setPlaybackSource(source)
  }, [])

  const playPrevious = useCallback(() => {
    resumeTimeRef.current = 0
    resumePlaybackRef.current = true
    setCurrentIndex(index => Math.max(index - 1, 0))
  }, [])

  const playNext = useCallback(() => {
    resumeTimeRef.current = 0
    resumePlaybackRef.current = true
    setCurrentIndex(index => Math.min(index + 1, playlist.length - 1))
  }, [playlist.length])

  const selectTrack = useCallback((index: number) => {
    resumeTimeRef.current = 0
    resumePlaybackRef.current = true
    setCurrentIndex(Math.min(Math.max(index, 0), playlist.length - 1))
  }, [playlist.length])

  const closePlayback = useCallback(() => {
    mediaRef.current?.pause()
    resumeTimeRef.current = 0
    resumePlaybackRef.current = false
    clearStoredSession()
    clearRequestUrl()
    setPlaylist([])
    setCurrentIndex(0)
    setPlaybackSource({ kind: 'file' })
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setState({
      status: 'idle',
      title: 'Sin archivo',
      message: 'Abre un archivo de audio o video desde Archivos, o selecciona una carpeta.',
    })
  }, [])

  useEffect(() => {
    const handleThemeChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? webDarkTheme : webLightTheme)
    }

    darkModeQuery.addEventListener('change', handleThemeChange)
    return () => darkModeQuery.removeEventListener('change', handleThemeChange)
  }, [])

  useEffect(() => {
    if (!currentItem) {
      return
    }

    setState({ status: 'loading', item: currentItem })

    setState({
      status: 'ready',
      item: currentItem,
      source: window.sdk.filesystem.getStreamUrl(currentItem.root, currentItem.path),
    })
  }, [currentItem])

  useEffect(() => {
    if (state.status !== 'ready') {
      mediaRef.current = null
      setIsPlaying(false)
      setDuration(0)
      return
    }

    setIsPlaying(false)
    setCurrentTime(resumeTimeRef.current)
    setDuration(0)
  }, [state])

  useEffect(() => {
    if (playlist.length === 0) {
      clearStoredSession()
      return
    }

    if (state.status !== 'ready') {
      return
    }

    saveStoredSession({
      playlist,
      currentIndex: Math.min(currentIndex, playlist.length - 1),
      currentTime,
      isPlaying,
      playbackSource,
    })
  }, [currentIndex, currentTime, isPlaying, playbackSource, playlist, state.status])

  const setMediaElement = useCallback((element: HTMLMediaElement | null) => {
    mediaRef.current = element

    if (element) {
      element.volume = volume
      element.muted = muted
    }
  }, [muted, volume])

  const togglePlay = () => {
    const media = mediaRef.current
    if (!media) {
      return
    }

    if (media.paused) {
      media.play().catch(reason => console.error(reason))
      return
    }

    media.pause()
  }

  const seek = (nextTime: number) => {
    const media = mediaRef.current
    if (!media) {
      return
    }

    media.currentTime = nextTime
    setCurrentTime(nextTime)
  }

  const changeVolume = (nextVolume: number) => {
    const media = mediaRef.current
    const normalizedVolume = Math.min(Math.max(nextVolume, 0), 1)
    setVolume(normalizedVolume)
    setMuted(normalizedVolume === 0)

    if (media) {
      media.volume = normalizedVolume
      media.muted = normalizedVolume === 0
    }
  }

  const toggleMute = () => {
    const media = mediaRef.current
    const nextMuted = volume === 0 ? false : !muted
    const nextVolume = volume === 0 ? 0.5 : volume

    setMuted(nextMuted)
    setVolume(nextVolume)

    if (media) {
      media.volume = nextVolume
      media.muted = nextMuted
    }
  }

  const handleLoadedMetadata = () => {
    const media = mediaRef.current
    setDuration(media?.duration && Number.isFinite(media.duration) ? media.duration : 0)

    if (!media) {
      return
    }

    if (resumeTimeRef.current > 0) {
      const nextTime = media.duration && Number.isFinite(media.duration)
        ? Math.min(resumeTimeRef.current, Math.max(media.duration - 0.5, 0))
        : resumeTimeRef.current
      media.currentTime = nextTime
      setCurrentTime(nextTime)
      resumeTimeRef.current = 0
    }

    if (resumePlaybackRef.current) {
      media.play().catch(reason => {
        console.error(reason)
        setIsPlaying(false)
      })
    }
  }

  const handleTimeUpdate = () => {
    setCurrentTime(mediaRef.current?.currentTime || 0)
  }

  const handleEnded = () => {
    setIsPlaying(false)
    if (hasNext) {
      playNext()
    }
  }

  const handleMediaError = () => {
    if (state.status !== 'ready') {
      return
    }

    setState({
      status: 'error',
      item: state.item,
      title: 'No se pudo reproducir',
      message: 'El archivo no existe, no se pudo leer o el formato no es compatible.',
    })
  }

  const toggleFullscreen = () => {
    const media = mediaRef.current
    if (!media || !document.fullscreenEnabled) {
      return
    }

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(reason => console.error(reason))
      return
    }

    media.requestFullscreen().catch(reason => console.error(reason))
  }

  const renderPlayerControls = (isVideo: boolean) => (
    <div className={styles.playerControls}>
      <div className={styles.scrubberRow}>
        <Caption1 className={styles.timeLabel}>{formatTime(currentTime)}</Caption1>
        <Slider
          aria-label="Progreso"
          className={styles.progressSlider}
          disabled={duration === 0}
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(currentTime, duration || 0)}
          onChange={(_, data) => seek(data.value)}
        />
        <Caption1 className={styles.timeLabel}>{formatTime(duration)}</Caption1>
      </div>

      <div className={styles.controlBar}>
        <div className={styles.controlGroup}>
          <Tooltip content="Cancion anterior" relationship="label">
            <Button
              aria-label="Cancion anterior"
              icon={<PreviousRegular />}
              disabled={!hasPrevious}
              onClick={playPrevious}
            />
          </Tooltip>
          <Button
            appearance="primary"
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            icon={isPlaying ? <PauseRegular /> : <PlayRegular />}
            onClick={togglePlay}
          />
          <Tooltip content="Siguiente cancion" relationship="label">
            <Button
              aria-label="Siguiente cancion"
              icon={<NextRegular />}
              disabled={!hasNext}
              onClick={playNext}
            />
          </Tooltip>
        </div>

        <div className={styles.volumeGroup}>
          <Tooltip content={muted ? 'Activar sonido' : 'Silenciar'} relationship="label">
            <Button
              aria-label={muted ? 'Activar sonido' : 'Silenciar'}
              icon={muted || volume === 0 ? <SpeakerMuteRegular /> : <Speaker2Regular />}
              onClick={toggleMute}
            />
          </Tooltip>
          <Slider
            aria-label="Volumen"
            className={styles.volumeSlider}
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onChange={(_, data) => changeVolume(data.value)}
          />
          {isVideo && (
            <Tooltip content="Pantalla completa" relationship="label">
              <Button
                aria-label="Pantalla completa"
                icon={<FullScreenMaximizeRegular />}
                disabled={!document.fullscreenEnabled}
                onClick={toggleFullscreen}
              />
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  )

  const renderBody = () => {
    if (state.status === 'loading') {
      return (
        <section className={styles.status}>
          <div className={styles.statusContent}>
            <Spinner label="Cargando archivo" />
            <Caption1>{fileName}</Caption1>
          </div>
        </section>
      )
    }

    if (state.status === 'ready') {
      const mediaClassName = `${styles.media} ${state.item.media.kind === 'audio' ? styles.audio : styles.video}`
      const mediaProps = {
        autoPlay: resumePlaybackRef.current,
        muted,
        ref: setMediaElement,
        src: state.source,
        onEnded: handleEnded,
        onError: handleMediaError,
        onLoadedMetadata: handleLoadedMetadata,
        onPause: () => setIsPlaying(false),
        onPlay: () => setIsPlaying(true),
        onTimeUpdate: handleTimeUpdate,
        onVolumeChange: () => {
          const media = mediaRef.current
          if (!media) {
            return
          }

          setMuted(media.muted)
          setVolume(media.volume)
        },
      }

      return (
        <div className={styles.playerStack}>
          {state.item.media.kind === 'audio'
            ? (
              <>
                <div className={styles.audioDisplay}>
                  <Subtitle2>{fileName}</Subtitle2>
                  <Caption1>{state.item.path}</Caption1>
                </div>
                <audio {...mediaProps} className={styles.hiddenMedia} />
              </>
            )
            : <video {...mediaProps} className={mediaClassName} playsInline />}
          {renderPlayerControls(state.item.media.kind === 'video')}
          {hasPlaybackQueue && (
            <div className={styles.transportBar}>
              <Tooltip content="Cancion anterior" relationship="label">
                <Button
                  aria-label="Cancion anterior"
                  icon={<PreviousRegular />}
                  disabled={!hasPrevious}
                  onClick={playPrevious}
                />
              </Tooltip>
              <div className={styles.transportInfo}>
                <Subtitle2>{fileName}</Subtitle2>
                <Caption1>
                  {playbackSourceLabel}
                  {playbackSourceTitle ? `: ${playbackSourceTitle}` : ''}
                  {' · '}
                  {currentIndex + 1} de {playlist.length}
                </Caption1>
              </div>
              <Tooltip content="Siguiente cancion" relationship="label">
                <Button
                  aria-label="Siguiente cancion"
                  icon={<NextRegular />}
                  disabled={!hasNext}
                  onClick={playNext}
                />
              </Tooltip>
            </div>
          )}
        </div>
      )
    }

    if (state.status === 'error') {
      return (
        <MessageBar intent="error">
          <MessageBarBody>
            <MessageBarTitle>{state.title}</MessageBarTitle>
            {state.message}
          </MessageBarBody>
        </MessageBar>
      )
    }

    return (
      <section className={styles.status}>
        <div className={styles.statusContent}>
          <FolderOpenRegular className={styles.emptyIcon} />
          <Subtitle2>{state.title}</Subtitle2>
          <Caption1>{state.message}</Caption1>
          <Button appearance="primary" icon={<FolderOpenRegular />} onClick={() => setFolderDialogOpen(true)}>
            Abrir carpeta
          </Button>
        </div>
      </section>
    )
  }

  return (
    <FluentProvider theme={theme}>
      <main className={styles.page}>
        <div className={styles.shell}>
          <header className={styles.header}>
            <div className={styles.titleBlock}>
              <Title2 className={styles.title}>{fileName}</Title2>
              <div className={styles.meta}>
                {currentItem && <Badge appearance="tint">{currentItem.root}</Badge>}
                {state.status === 'ready' && <Badge appearance="outline">{state.item.media.kind}</Badge>}
                {currentItem && <Badge appearance="outline">{playbackSourceLabel}</Badge>}
                {hasPlaybackQueue && <Badge appearance="filled">{currentIndex + 1} de {playlist.length}</Badge>}
                {playbackSourceTitle && <Caption1>{playbackSourceTitle}</Caption1>}
                {currentItem && <Caption1>{currentItem.path}</Caption1>}
              </div>
            </div>
            <div className={styles.actions}>
              {currentItem && (
                <Tooltip content="Cerrar reproduccion" relationship="label">
                  <Button
                    aria-label="Cerrar reproduccion"
                    icon={<DismissRegular />}
                    onClick={closePlayback}
                  />
                </Tooltip>
              )}
              <Button icon={<FolderOpenRegular />} onClick={() => setFolderDialogOpen(true)}>
                Abrir carpeta
              </Button>
              <Button onClick={() => setPlaylistLibraryOpen(true)}>
                Listas
              </Button>
              <Tooltip content="Cancion anterior" relationship="label">
                <Button
                  aria-label="Cancion anterior"
                  icon={<PreviousRegular />}
                  disabled={!hasPrevious}
                  onClick={playPrevious}
                />
              </Tooltip>
              <Tooltip content="Siguiente cancion" relationship="label">
                <Button
                  aria-label="Siguiente cancion"
                  icon={<NextRegular />}
                  disabled={!hasNext}
                  onClick={playNext}
                />
              </Tooltip>
            </div>
          </header>

          <div className={hasPlaybackQueue ? styles.playbackGrid : undefined}>
            <section className={styles.surface}>
              {renderBody()}
            </section>
            {hasPlaybackQueue && (
              <Suspense fallback={<div className={styles.panelFallback}><Spinner size="tiny" /></div>}>
                <PlaylistPanel
                  items={playlist}
                  currentIndex={currentIndex}
                  source={playbackSource}
                  onSelect={selectTrack}
                />
              </Suspense>
            )}
          </div>
        </div>
      </main>

      {folderDialogOpen && (
        <Suspense fallback={null}>
          <FolderDialog
            open={folderDialogOpen}
            initialRoot={folderInitialRoot}
            initialPath={folderInitialPath}
            onOpenChange={setFolderDialogOpen}
            onPlayItems={playItems}
          />
        </Suspense>
      )}
      {playlistLibraryOpen && (
        <Suspense fallback={null}>
          <PlaylistLibrary
            open={playlistLibraryOpen}
            currentItems={playlist}
            onOpenChange={setPlaylistLibraryOpen}
            onPlayItems={playItems}
          />
        </Suspense>
      )}
    </FluentProvider>
  )
}

const App = () => (
  <StrictMode>
    <PlayerContent />
  </StrictMode>
)

createRoot(document.getElementById('root')!).render(<App />)
