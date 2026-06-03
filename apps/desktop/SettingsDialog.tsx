import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Radio,
  RadioGroup,
  makeStyles,
} from '@fluentui/react-components'

import { isAppLaunchMode, type AppLaunchMode } from './preferences'

const useStyles = makeStyles({
  launchOptions: {
    display: 'grid',
    gap: '8px',
  },
})

interface SettingsDialogProps {
  appLaunchMode: AppLaunchMode
  open: boolean
  onAppLaunchModeChange: (launchMode: AppLaunchMode) => void
  onOpenChange: (open: boolean) => void
}

const SettingsDialog = ({
  appLaunchMode,
  open,
  onAppLaunchModeChange,
  onOpenChange,
}: SettingsDialogProps) => {
  const styles = useStyles()

  return (
    <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Ajustes</DialogTitle>
          <DialogContent>
            <RadioGroup
              className={styles.launchOptions}
              value={appLaunchMode}
              onChange={(_, data) => {
                if (isAppLaunchMode(data.value)) {
                  onAppLaunchModeChange(data.value)
                }
              }}
            >
              <Radio value="same-tab" label="Abrir aplicaciones en la misma pestana" />
              <Radio value="new-tab" label="Abrir aplicaciones en otra pestana" />
              <Radio value="new-window" label="Abrir aplicaciones en una ventana nueva" />
            </RadioGroup>
          </DialogContent>
          <DialogActions>
            <Button appearance="primary" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

export default SettingsDialog
