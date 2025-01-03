import { type FC, useEffect, useState } from 'react'
import { Button, Card, CardHeader, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger, ToolbarButton, Text, Caption1 } from '@fluentui/react-components'
import { bundleIcon, CloudArrowUpFilled, CloudArrowUpRegular, SubtractCircleFilled, SubtractCircleRegular } from '@fluentui/react-icons'
import { useUploads } from './../context/uploads'
import { useExplorer } from '../context/explorer'

const QuitIcon = bundleIcon(SubtractCircleFilled, SubtractCircleRegular)
const UploadsIcon = bundleIcon(CloudArrowUpFilled, CloudArrowUpRegular)

const Item: FC<ItemProps> = ({ upload, onQuit }) => {
  const [progress, setProgress] = useState(upload.fileTransfer.progress)

  useEffect(() => {
    const update = () => setProgress(upload.fileTransfer.progress)
    const ending = () => setProgress(100)
    upload.fileTransfer.addEventListener('progress', update)
    upload.fileTransfer.addEventListener('end', ending)
    return () => {
      upload.fileTransfer.removeEventListener('progress', update)
      upload.fileTransfer.removeEventListener('end', ending)
    }
  }, [])

  const handleOnQuit = () => {
    if (progress < 100) {
      upload.fileTransfer.cancel()
    }
    onQuit()
  }

  return (
    <Card>
      <CardHeader
        header={<Text weight="semibold">{upload.name}</Text>}
        description={<Caption1>{progress === 100 ? 'Completado' : `${progress}%`}</Caption1>}
        action={
          <Button
            appearance="transparent"
            icon={<QuitIcon />}
            aria-label="Cancel - remove"
            onClick={handleOnQuit}
          />
        }
      />
    </Card>
  )
}

interface ItemProps {
  upload: Transfer
  onQuit(): void
}

export default () => {
  const { baseDir, path } = useExplorer()
  const { uploads, addUpload, quitUpload } = useUploads()
  const [open, setOpen] = useState<boolean>(false)

  const handleOnUpload = () => {
    const inputFile = document.createElement('input')
    inputFile.setAttribute('type', 'file')
    inputFile.setAttribute('multiple', '')
    inputFile.addEventListener('change', () => {
      if (inputFile.files) {
        for (const file of inputFile.files) {
          setTimeout(() => {
            addUpload([baseDir, ...path], file)
          }, 100)
        }
      }
    })
    inputFile.click()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(_, data) => setOpen(data.open)}
    >
      <DialogTrigger disableButtonEnhancement>
        <ToolbarButton
          appearance="subtle"
          aria-label="Uploads"
          icon={<UploadsIcon />}
        />
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Subidas</DialogTitle>
          <DialogContent>
            {uploads.length === 0 && <Caption1>Lista vacía.</Caption1>}
            {uploads.map((upload, index) => (
              <Item
                key={index}
                upload={upload}
                onQuit={() => quitUpload(index)}
              />
            ))}
          </DialogContent>
          <DialogActions style={{ marginTop: '16px' }}>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">Cerrar</Button>
            </DialogTrigger>
            <Button appearance="primary" onClick={handleOnUpload}>Subir archivo</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}