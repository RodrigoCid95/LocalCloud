import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { FluentProvider, webDarkTheme, webLightTheme } from '@fluentui/react-components'
import App from './App.tsx'

const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')

const Container = () => {
  const [theme, setTheme] = useState(darkModeQuery.matches ? webDarkTheme : webLightTheme)
  useEffect(() => {
    darkModeQuery.addEventListener('change', e => setTheme(e.matches ? webDarkTheme : webLightTheme))
  })
  return (
    <FluentProvider theme={theme}>
      <App />
    </FluentProvider>
  )
}

document.addEventListener('onConnectorReady', () => createRoot(document.getElementById('root')!).render(
  <Container />,
))