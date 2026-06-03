import {
  Badge,
  Body1,
  Button,
  Caption1,
  Subtitle2,
} from '@fluentui/react-components'
import {
  MusicNote2Regular,
  VideoRegular,
} from '@fluentui/react-icons'

import { getFileName } from '../media'
import { useStyles } from '../styles'
import type { PlaybackSource, PlaylistItem } from '../types'

type PlaylistPanelProps = {
  items: PlaylistItem[]
  currentIndex: number
  source: PlaybackSource
  onSelect: (index: number) => void
}

const PlaylistPanel = ({ items, currentIndex, source, onSelect }: PlaylistPanelProps) => {
  const styles = useStyles()

  if (items.length < 2) {
    return null
  }

  const title = source.kind === 'playlist' ? 'Lista en reproduccion' : 'Carpeta en reproduccion'
  const sourceName = source.kind === 'file' ? '' : source.name

  return (
    <aside className={styles.playlistPanel}>
      <div className={styles.playlistHeader}>
        <div>
          <Subtitle2>{title}</Subtitle2>
          <br />
          <Caption1>{sourceName ? `${sourceName} · ` : ''}{items.length} archivos</Caption1>
        </div>
        <Badge appearance="tint">{currentIndex + 1} de {items.length}</Badge>
      </div>

      <div className={styles.trackList}>
        {items.map((item, index) => {
          const selected = index === currentIndex
          return (
            <Button
              key={item.path}
              appearance={selected ? 'primary' : 'subtle'}
              className={styles.trackButton}
              icon={item.media.kind === 'audio' ? <MusicNote2Regular /> : <VideoRegular />}
              onClick={() => onSelect(index)}
            >
              <span className={styles.trackInfo}>
                <Body1 className={styles.trackName}>{getFileName(item.path)}</Body1>
                <Caption1 className={styles.trackPath}>{item.path}</Caption1>
              </span>
            </Button>
          )
        })}
      </div>
    </aside>
  )
}

export default PlaylistPanel
