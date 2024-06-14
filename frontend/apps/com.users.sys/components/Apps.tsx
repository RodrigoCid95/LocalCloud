import { type FC, useState, useEffect, useCallback } from "react"
import { Dialog, DialogSurface, DialogBody, DialogTitle, DialogActions, DialogTrigger, Button, Spinner, Caption1, Switch } from "@fluentui/react-components"

const Item: FC<ItemProps> = ({ uid, app }) => {
  const [checked, setChecked] = useState<boolean>(app.assign)
  const [disable, setDisable] = useState<boolean>(false)

  const handleChange = useCallback(() => {
    setDisable(true)
    const callback = checked ? window.connectors.users.unassignApp : window.connectors.users.assignApp
    callback(uid, app.package_name)
      .then(() => {
        setChecked(!checked)
        setDisable(false)
      })
  }, [setDisable, checked, setChecked, app])

  return (
    <Switch
      label={app.title}
      checked={checked}
      disabled={disable}
      onChange={handleChange}
    />
  )
}

interface App extends Apps.App {
  assign: boolean
}
interface ItemProps {
  uid: Users.User['uid']
  app: App
}

const List: FC<ListProps> = ({ user }) => {
  const [loading, setLoading] = useState<boolean>(true)
  const [apps, setApps] = useState<App[]>([])

  useEffect(() => {
    window.connectors.apps.list()
      .then(generalAppList => {
        window.connectors.apps.listByUID(user.uid)
          .then(userApps => {
            const appList: App[] = generalAppList.map(generalApp => ({
              ...generalApp,
              assign: userApps.findIndex(userApp => generalApp.package_name === userApp.package_name) > -1
            }))
            setLoading(false)
            setApps(appList)
          })
      }
      )
  }, [setApps, setLoading])

  if (loading) {
    return <Spinner />
  }
  if (apps.length === 0) {
    return <Caption1>No hay aplicaciones instaladas.</Caption1>
  }
  return apps.map((app, index) => <Item key={index} app={app} uid={user.uid} />)
}

interface ListProps {
  user: Users.User
}

const Apps: FC<AppsProps> = ({ user, onClose }) => {
  return (
    <Dialog
      open={user !== undefined}
      onOpenChange={(_, data) => {
        if (!data.open) {
          onClose()
        }
      }}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Aplicaciones del usuario - {user?.name}</DialogTitle>
          {user && <List user={user} />}
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

interface AppsProps {
  user: Users.User | undefined
  onClose(): void
}

export default Apps