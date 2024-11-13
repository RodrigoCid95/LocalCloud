import { Suspense, lazy, useEffect, useState, StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { FluentProvider, Spinner, webDarkTheme, webLightTheme } from '@fluentui/react-components'
import './main.css'

const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
const App = lazy(() => import('./App'))

const Container = () => {
  const [theme, setTheme] = useState(darkModeQuery.matches ? webDarkTheme : webLightTheme)
  useEffect(() => {
    darkModeQuery.addEventListener('change', e => setTheme(e.matches ? webDarkTheme : webLightTheme))
  })
  return (
    <StrictMode>
      <FluentProvider theme={theme}>
        <Suspense fallback={<Spinner className='center-middle' size='huge' />}>
          <App />
        </Suspense>
      </FluentProvider>
    </StrictMode>
  )
}

document.addEventListener('onConnectorReady', () => ReactDOM.createRoot(document.getElementById('root')!).render(
  <Container />,
))