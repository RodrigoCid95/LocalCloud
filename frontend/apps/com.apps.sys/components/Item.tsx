import { useCallback, useState, type FC } from "react"
import { Caption1, Card, CardHeader, makeStyles, tokens, Text, ProgressBar, Field } from "@fluentui/react-components"
import Options from "./Options"

const useStyles = makeStyles({
  card: {
    width: "360px",
    maxWidth: "100%",
    height: "fit-content",
  },
  caption: {
    color: tokens.colorNeutralForeground3,
  },
})

const Item: FC<ItemProps> = ({ app, onReload, onPermissions, onSecureSources }) => {
  const styles = useStyles()
  const [progressUpdate, setProgressUpdate] = useState<number>(0)
  const [progressValidation, setProgressValidation] = useState<ProgressValidation>({})
  const [deleting, setDeleting] = useState<boolean>(false)

  const handleOnUpdate = useCallback(() => {
    const inputFile = document.createElement('input')
    inputFile.type = 'file'
    inputFile.multiple = false
    inputFile.accept = 'application/zip'
    inputFile.addEventListener('change', async () => {
      const file = inputFile.files?.item(0)
      if (file) {
        const updater = window.connectors.apps.install(file, true)
        updater.on('progress', (progress: number) => setProgressUpdate(progress))
        updater.on('error', () => setProgressValidation({ message: 'Ocurrió un error al actualizar el paquete.', state: 'error' }))
        updater.on('end', onReload)
        updater.start()
      }
    })
    inputFile.click()
  }, [setProgressUpdate, setProgressValidation, onReload])

  const handleDelete = useCallback(() => {
    setDeleting(true)
    window.connectors.apps.uninstall(app.package_name).then(onReload)
  }, [setDeleting, app, onReload])

  if (deleting) {
    return (
      <Field validationMessage={`Desinstalando "${app.title}".`} validationState="none">
        <ProgressBar />
      </Field>
    )
  }

  return (
    <Card className={styles.card} orientation="vertical">
      <CardHeader
        header={<Text weight="semibold">{app.title} ({app.package_name})</Text>}
        description={<Caption1 className={styles.caption}>{app.author}</Caption1>}
        action={(
          <Options
            onUpdate={handleOnUpdate}
            onPermissions={onPermissions}
            onSecureSources={onSecureSources}
            onUninstall={handleDelete}
          />
        )}
      />
      <p style={{ margin: 0 }}>{app.description}</p>
      {progressUpdate > 0 && (
        <Field validationMessage={progressValidation.message} validationState={progressValidation.state}>
          <ProgressBar max={100} value={progressUpdate} />
        </Field>
      )}
    </Card>
  )
}

interface ProgressValidation {
  message?: string
  state?: 'error' | 'warning' | 'success' | 'none'
}
interface ItemProps {
  app: Apps.App
  onReload(): void
  onPermissions(): void
  onSecureSources(): void
}

export default Item