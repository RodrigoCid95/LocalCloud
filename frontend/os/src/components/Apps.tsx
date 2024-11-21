import { type FC } from 'react'
import { Body1, Body2, Button, Card, CardFooter, CardHeader, makeStyles, tokens } from '@fluentui/react-components'
import { List, ListItem } from '@fluentui/react-list-preview'
import { useSetupContext } from '../context/setup'

const useStyles = makeStyles({
  card: {
    padding: tokens.spacingVerticalXXL
  },
  next: {
    marginLeft: 'auto'
  }
})

const Apps: FC<AppsProps> = ({ onNext }) => {
  const styles = useStyles()
  const { files, setFiles } = useSetupContext()

  const handleOnSelectFiles = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.onchange = () => {
      if (input.files) {
        setFiles(Array.from(input.files))
      }
    }
    input.click()
  }

  return (
    <Card className={styles.card}>
      <CardHeader
        header={<Body1><b>Paso 3</b> (Apps)</Body1>}
      />
      <Body2>Carga los paquetes de aplicaciones para instalar.</Body2>
      <List>
        {files.map((file, index) => (
          <ListItem key={index}>
            {file.name}
          </ListItem>
        ))}
      </List>
      <CardFooter>
        <Button onClick={handleOnSelectFiles}>Seleccionar archivos</Button>
        {files.length > 0 && <Button className={styles.next} onClick={onNext}>Finalizar</Button>}
      </CardFooter>
    </Card>
  )
}

export default Apps

interface AppsProps {
  onNext: () => void
}