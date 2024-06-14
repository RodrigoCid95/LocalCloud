import { useCallback, useState, type FC } from "react"
import { Spinner, Toolbar, ToolbarButton } from "@fluentui/react-components"
import { ArrowClockwise24Filled, AppsAddIn24Filled } from '@fluentui/react-icons'

const AppsToolbar: FC<ToolbarProps> = ({ onReload }) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)

  const handleInstall = useCallback(() => {
    const inputFile = document.createElement('input')
    inputFile.type = 'file'
    inputFile.multiple = false
    inputFile.accept = 'application/zip'
    inputFile.addEventListener('change', async () => {
      const file = inputFile.files?.item(0)
      if (file) {
        setLoading(true)
        const installer = window.connectors.apps.install(file)
        installer.on('progress', (percent: number) => setProgress(percent))
        installer.on('end', () => {
          setLoading(false)
          setProgress(0)
          onReload()
        })
        installer.start()
      }
    })
    inputFile.click()
  }, [setLoading, setProgress, onReload])

  if (loading) {
    return (
      <Spinner
        style={{ justifyContent: 'flex-start' }}
        size="tiny"
        label={`${progress}%`}
      />
    )
  }
  return (
    <Toolbar>
      <ToolbarButton
        aria-label="Refresh"
        appearance="subtle"
        icon={<ArrowClockwise24Filled />}
        onClick={onReload}
      />
      <ToolbarButton
        aria-label="Install"
        appearance="subtle"
        icon={<AppsAddIn24Filled />}
        onClick={handleInstall}
      />
    </Toolbar>
  )
}

interface ToolbarProps {
  onReload(): void
}

export default AppsToolbar