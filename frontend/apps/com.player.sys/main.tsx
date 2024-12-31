import { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { FluentProvider, webDarkTheme, webLightTheme, Spinner, Text } from '@fluentui/react-components'
import './main.css'

const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')

const extractParams = (): Params => {
  const search = location.search.substring(1, location.search.length)
  let entries = search
    .split('&')
    .map(entry => entry.split('='))
  const params: Params = {}
  for (const [key, value] of entries) {
    params[key] = value
  }
  return params
}

const Container = () => {
  const [theme, setTheme] = useState(darkModeQuery.matches ? webDarkTheme : webLightTheme)
  const [src, setSrc] = useState<string | undefined>(undefined)

  useEffect(() => {
    darkModeQuery.addEventListener('change', e => setTheme(e.matches ? webDarkTheme : webLightTheme))
    let { open = '' } = extractParams()
    if (open[0] === '/') {
      const urlSegments = open.split('/')
      urlSegments.shift()
      open = window.createURL({ path: ['file', ...urlSegments] }).href
    }
    setSrc(open)
  }, [])

  return (
    <FluentProvider theme={theme}>
      {
        src !== undefined
          ? src !== ''
            ? <video className='center-middle' src={src} controls></video>
            : <Text className='center-middle'>Reproductor de video</Text>
          : <Spinner className='center-middle' />
      }
    </FluentProvider>
  )
}

document.addEventListener('onConnectorReady', () => ReactDOM.createRoot(document.getElementById('root')!).render(
  <Container />,
))

interface Params {
  [x: string]: string
}