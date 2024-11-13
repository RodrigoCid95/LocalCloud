import { type FC, useEffect, useState } from "react"
import { Button, Caption1, Card, CardHeader, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger, ToolbarButton, Text } from "@fluentui/react-components"
import { ArrowCircleDownFilled, ArrowCircleDownRegular, bundleIcon, CloudArrowDownFilled, CloudArrowDownRegular, SubtractCircleFilled, SubtractCircleRegular } from '@fluentui/react-icons'
import { useDownloads } from "../context/downloads"

const QuitIcon = bundleIcon(SubtractCircleFilled, SubtractCircleRegular)
const DownloadIcon = bundleIcon(ArrowCircleDownFilled, ArrowCircleDownRegular)
const DownloadsIcon = bundleIcon(CloudArrowDownFilled, CloudArrowDownRegular)

const Item: FC<ItemProps> = ({ download, onQuit }) => {
  const [progress, setProgress] = useState(download.fileTransfer.progress)

  useEffect(() => {
    const update = () => setProgress(download.fileTransfer.progress)
    const ending = () => setProgress(100)
    download.fileTransfer.addEventListener('progress', update)
    download.fileTransfer.addEventListener('complete', ending)
    return () => {
      download.fileTransfer.removeEventListener('progress', update)
      download.fileTransfer.removeEventListener('complete', ending)
    }
  }, [])

  const handleOnQuit = () => {
    if (progress < 100) {
      download.fileTransfer.cancel()
      download.fileTransfer.remove()
    }
    onQuit()
  }

  return (
    <Card>
      <CardHeader
        header={<Text weight="semibold">{download.name}</Text>}
        description={<Caption1>{progress === 100 ? 'Completado' : `${progress}%`}</Caption1>}
        action={
          <div style={{ display: 'flex' }}>
            {progress === 100 && (
              <Button
                appearance="transparent"
                icon={<DownloadIcon />}
                aria-label="Download"
                onClick={() => download.fileTransfer.start()}
              />
            )}
            <Button
              appearance="transparent"
              icon={<QuitIcon />}
              aria-label="Cancel - remove"
              onClick={handleOnQuit}
            />
          </div>
        }
      />
    </Card>
  )
}

interface ItemProps {
  download: Download
  onQuit(): void
}

export default () => {
  const { downloads, quitDownload } = useDownloads()
  const [open, setOpen] = useState<boolean>(false)

  return (
    <Dialog
      open={open}
      onOpenChange={(_, data) => setOpen(data.open)}
    >
      <DialogTrigger disableButtonEnhancement>
        <ToolbarButton
          appearance="subtle"
          aria-label="Downloads"
          icon={<DownloadsIcon />}
        />
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Descargas</DialogTitle>
          <DialogContent>
            {downloads.length === 0 && <Caption1>Lista vacía.</Caption1>}
            {downloads.map((download, index) => (
              <Item
                key={download.name}
                download={download}
                onQuit={() => quitDownload(index)}
              />
            ))}
          </DialogContent>
          <DialogActions style={{ marginTop: '16px' }}>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">Cerrar</Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}