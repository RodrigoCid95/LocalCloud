import { MenuItem } from "@fluentui/react-components"
import { useCallback, useEffect, useState, type FC } from "react"

const DownloadItem: FC<DownloadItemProps> = ({ upload, name, onQuit }) => {
  const [progress, setProgress] = useState<number>(upload.progress)

  useEffect(() => {
    if (upload.progress < 100) {
      const update = (percent: number) => setProgress(percent)
      upload.on('progress', update)
      return () => {
        upload.off('progress', update)
      }
    }
  }, [upload, setProgress])

  const handleOnClick = useCallback(() => {
    if (upload.progress === 100) {
      onQuit()
    }
  }, [upload, onQuit])

  return (
    <MenuItem onClick={handleOnClick}>
      {name} - {progress === 100 ? 'Completado' : `${progress}%`}
    </MenuItem>
  )
}

interface DownloadItemProps {
  upload: FileTransfer
  name: string
  onQuit(): void
}

export default DownloadItem