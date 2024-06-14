import { lazy, Suspense, useEffect, useState } from "react"
import { Spinner } from "@fluentui/react-components"

const Login = lazy(() => import('./Login'))
const Dashboard = lazy(() => import('./Dashboard'))
const DevMode = lazy(() => import('./DevMode'))

const App = () => {
  const [loading, setLoading] = useState<boolean>(true)
  const [auth, setAuth] = useState<boolean>(false)
  const [devMode, setDevMode] = useState<boolean>(false)

  useEffect(() => {
    if (document.body.dataset.devMode !== undefined) {
      setLoading(false)
      setDevMode(true)
    } else {
      (window.connectors.auth.status as Auth.StatusMethod)().then(a => {
        setLoading(false)
        setAuth(a)
      })
    }
  })

  if (loading) {
    return <Spinner />
  } else {
    if (devMode) {
      return (
        <Suspense fallback={<Spinner />}>
          <DevMode />
        </Suspense>
      )
    }
    if (!auth) {
      return (
        <Suspense fallback={<Spinner />}>
          <Login />
        </Suspense>
      )
    } else {
      return (
        <Suspense fallback={<Spinner />}>
          <Dashboard />
        </Suspense>
      )
    }
  }
}

export default App