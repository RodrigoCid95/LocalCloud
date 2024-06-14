import { type FC, useState, useEffect, useCallback } from "react"
import { Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, Spinner, DialogActions, DialogTrigger, Button, Switch, Tooltip, Caption1 } from "@fluentui/react-components"

const AppSource: FC<AppSourceProps> = ({source}) => {
  const [checked, setChecked] = useState<boolean>(source.active)
  const [disable, setDisable] = useState<boolean>(false)

  const handleChange = useCallback(() => {
    setDisable(true)
    const callback = checked ? window.connectors.sources.disable : window.connectors.sources.enable
    callback(source.id)
      .then(() => {
        setChecked(!checked)
        setDisable(false)
      })
      .catch(() => setDisable(false))
  }, [setDisable, checked, setChecked, source])

  return (
    <Tooltip
      content={source.source}
      relationship="description"
      withArrow
    >
      <Switch
        label={source.justification}
        disabled={disable}
        checked={checked}
        onChange={handleChange}
      />
    </Tooltip>
  )
}

interface AppSourceProps {
  source: SecureSources.Source
}

const AppSecureSources: FC<AppSecureSourcesProps> = ({ app, onClose }) => {
  const [loading, setLoading] = useState<boolean>(true)
  const [sources, setSources] = useState<SecureSources.Source[]>([])

  useEffect(() => {
    const { package_name } = app
    window.connectors.sources.find({ package_name }).then(result => {
      setSources(result)
      setLoading(false)
    })
  }, [app, setSources, setLoading])

  return (
    <Dialog
      open={app !== undefined}
      onOpenChange={(_, data) => {
        if (!data.open) {
          onClose()
        }
      }}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Fuentes seguras de {app.title}</DialogTitle>
          <DialogContent>
            {loading && <Spinner />}
            {sources.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", }}>
                {sources.map((source, index) => (
                  <AppSource
                    key={index}
                    source={source}
                  />
                ))}
              </div>
            )}
            {sources.length === 0 && <Caption1>Esta app no cuenta con fuentes seguras.</Caption1>}
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="primary">Cerrar</Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

interface AppSecureSourcesProps {
  app: Apps.App
  onClose(): void
}

export default AppSecureSources
