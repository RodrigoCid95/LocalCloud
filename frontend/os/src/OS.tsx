import { lazy, Suspense, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Spinner } from '@fluentui/react-components'
import App from './components/App'

const Login = lazy(() => import('./Login'))
const Dashboard = lazy(() => import('./Dashboard'))
const DevMode = lazy(() => import('./DevMode'))

const OS = () => {
  const [loading, setLoading] = useState<boolean>(true)
  const [auth, setAuth] = useState<boolean>(false)

  useEffect(() => {
    if (window.connectors.auth.status) {
      setLoading(true)
      window.connectors.auth.status().then(a => {
        setLoading(false)
        setAuth(a)
      })
    }
  }, [])

  if (loading) {
    return <Spinner />
  } else {
    if (document.body.dataset.devMode) {
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

document.addEventListener('onConnectorReady', () => createRoot(document.getElementById('root')!).render(
  <App>
    <OS />
  </App>,
))