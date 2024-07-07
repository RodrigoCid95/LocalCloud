import { useCallback, useEffect, useState } from "react"
import { Spinner, Title1, Title3, makeStyles } from "@fluentui/react-components"
import Item from "./components/Item"
import AppsToolbar from "./components/Toolbar"
import AppPermissions from "./components/Permissions"
import AppSecureSources from "./components/SecureSources"

const useStyles = makeStyles({
  main: {
    padding: '16px'
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '4px'
  }
})

const App = () => {
  const styles = useStyles()
  const [apps, setApps] = useState<Apps.App[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [appPermissions, setAppPermissions] = useState<Apps.App | undefined>(undefined)
  const [appSecureSources, setAppSecureSources] = useState<Apps.App | undefined>(undefined)

  const handleLoadApps = useCallback(() => {
    setLoading(true)
    window.connectors.apps.list().then((list) => {
      setApps(list)
      setLoading(false)
    })
  }, [setApps, setLoading])

  useEffect(() => {
    handleLoadApps()
  }, [handleLoadApps])

  if (loading) {
    return <Spinner className='center-middle' size='huge' />
  }
  return (
    <div className={styles.main}>
      <Title1>Aplicaciones</Title1>
      <AppsToolbar onReload={handleLoadApps} />
      <div className={styles.container}>
        {apps.length === 0 && <Title3>No hay apps instaladas.</Title3>}
        {apps.map((app, index) => (
          <Item
            key={index}
            app={app}
            onReload={handleLoadApps}
            onPermissions={() => setAppPermissions(app)}
            onSecureSources={() => setAppSecureSources(app)}
          />
        ))}
      </div>
      {appPermissions !== undefined && <AppPermissions app={appPermissions} onClose={() => setAppPermissions(undefined)} />}
      {appSecureSources !== undefined && <AppSecureSources app={appSecureSources} onClose={() => setAppSecureSources(undefined)} />}
    </div>
  )
}

export default App