import { type FC, useEffect, useState } from 'react'
import { FluentProvider, webDarkTheme, webLightTheme } from '@fluentui/react-components'

const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')

const App: FC<AppProps> = ({ children }) => {
  const [theme, setTheme] = useState(darkModeQuery.matches ? webDarkTheme : webLightTheme)

  useEffect(() => {
    darkModeQuery.addEventListener('change', e => setTheme(e.matches ? webDarkTheme : webLightTheme))
  })

  return (
    <FluentProvider theme={theme}>
      {children}
    </FluentProvider>
  )
}

export default App

interface AppProps {
  children: React.ReactNode
}