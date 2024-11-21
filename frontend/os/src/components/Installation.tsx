import { useEffect, useState } from "react"
import { useSetupContext } from './../context/setup'
import { makeStyles, tokens, Card, CardHeader, Body1, CardFooter, Button, Spinner } from "@fluentui/react-components"
import { List, ListItem } from "@fluentui/react-list-preview"

const useStyles = makeStyles({
  card: {
    padding: tokens.spacingVerticalXXL
  },
  done: {
    marginLeft: 'auto'
  }
})

export default () => {
  const styles = useStyles()
  const { activeIndex, files, uid } = useSetupContext()
  const [logs, setLogs] = useState<string[]>([])
  const [done, setDone] = useState<boolean>(false)
  const [restarting, setRestarting] = useState<boolean>(false)

  useEffect(() => {
    if (activeIndex === 3) {
      install()
    }
  }, [activeIndex])

  const install = async () => {
    for (const file of files) {
      await new Promise<void>(resolve =>
        upload(file, uid)
          .progress(progress => {
            setLogs(oldVal => [...oldVal, `Instalando ${file.name} (${progress}%)`])
          })
          .end(async () => {
            setLogs(oldVal => [...oldVal, `Instalado ${file.name}`])
            setTimeout(() => {
              resolve()
            }, 500)
          })
      )
    }
    setDone(true)
  }

  const handleOnReboot = () => {
    setRestarting(true)
    fetch('/setup/reboot', {
      method: 'post'
    }).then(() => {
      setTimeout(() => {
        window.location.reload()
      }, 10000)
    })
  }

  return (
    <Card className={styles.card}>
      <CardHeader
        header={<Body1><b>Finalizando</b></Body1>}
      />
      <List>
        {logs.map((log, index) => (
          <ListItem key={index}>
            {log}
          </ListItem>
        ))}
      </List>
      <CardFooter>
        {done && (
          restarting
            ? <Spinner className={styles.done} />
            : <Button className={styles.done} appearance="primary" onClick={handleOnReboot}>Reiniciar</Button>
        )}
      </CardFooter>
    </Card>
  )
}

const upload = (file: File, uid: Users.User['uid']) => {
  const xhr = new XMLHttpRequest()
  const form = new FormData()
  const name = file.name.split('.')
  name.pop()
  form.append('uid', uid.toString())
  form.append(name.join('.'), file)
  xhr.open('PUT', '/setup/apps')
  const emitter = new EventTarget()
  xhr.upload.onprogress = (event) => {
    if (event.lengthComputable) {
      const progress = Number(((event.loaded / event.total) * 100).toFixed(2))
      emitter.dispatchEvent(new CustomEvent('progress', { detail: progress }))
      if (progress === 100) {
        const isJSON = xhr.getResponseHeader('content-type')?.includes('application/json')
        const response = isJSON ? JSON.parse(xhr.response) : xhr.response
        emitter.dispatchEvent(new CustomEvent('end', { detail: response }))
      }
    }
  }
  xhr.send(form)
  const methods = {
    progress: (progressCallback: (progress: number) => void) => {
      emitter.addEventListener('progress', (event: any) => progressCallback(event.detail))
      return methods
    },
    end: (endCallback: (response: any) => void) => emitter.addEventListener('end', (event: any) => endCallback(event.detail))
  }
  return methods
}