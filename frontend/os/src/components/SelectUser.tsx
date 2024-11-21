import { type FC, useState } from 'react'
import { Body1, Body2, Button, Card, CardFooter, CardHeader, Field, Input, makeStyles, Spinner, tokens } from '@fluentui/react-components'
import { useSetupContext } from '../context/setup'

const useStyles = makeStyles({
  card: {
    padding: tokens.spacingVerticalXXL
  },
  next: {
    marginLeft: 'auto'
  }
})

const SelectUser: FC<SelectUserProps> = ({ onNext }) => {
  const styles = useStyles()
  const { setUser } = useSetupContext()
  const [name, setName] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState('')

  const handleOnClick = () => {
    if (name !== '') {
      setLoading(true)
      fetch('/setup/user', {
        method: 'post',
        body: JSON.stringify({ name }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then(response => {
          if (!response.ok) {
            setLoading(false)
            setError(`El nombre de usuario ${name} no es válido.`)
          } else {
            setUser({ name, existent: response.existent })
            onNext()
            setLoading(false)
          }
        })
    }
  }

  return (
    <Card className={styles.card}>
      <CardHeader
        header={<Body1><b>Paso 1</b> (Usuario)</Body1>}
      />
      <Body2>Escribe un nombre nuevo o existente para usar en LocalCloud.</Body2>
      <Body1>El nombre que elijas no debe pertenecer al sistema o puede ser uno creado anteriormente con LocalCloud.</Body1>
      <Field
        label="Usuario"
        validationMessage={error}
        validationState={error ? 'error' : 'none'}
        required
      >
        <Input type='text' value={name} onChange={e => setName(e.target.value)} onBlur={() => setError('')} />
      </Field>
      <CardFooter>
        {loading
          ? <Spinner className={styles.next} />
          : <Button className={styles.next} onClick={handleOnClick}>Siguiente</Button>
        }
      </CardFooter>
    </Card>
  )
}

export default SelectUser

interface SelectUserProps {
  onNext: () => void
}