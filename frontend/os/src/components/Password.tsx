import { type FC, useState } from 'react'
import { useSetupContext } from './../context/setup'
import { Body1, Body2, Button, Card, CardFooter, CardHeader, Field, Input, makeStyles, Spinner, tokens } from '@fluentui/react-components'

const useStyles = makeStyles({
  card: {
    padding: tokens.spacingVerticalXXL
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: tokens.spacingVerticalS
  }
})

const Password: FC<PasswordProps> = ({ onPrev, onNext }) => {
  const { user, setUid } = useSetupContext()
  const styles = useStyles()
  const [loading, setLoading] = useState<boolean>(false)
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [password2, setPassword2] = useState<string>('')

  const handleOnClick = () => {
    if (password === '') {
      return
    }
    if (!user.existent && password2 === '') {
      return
    }
    if (!user.existent && password !== password2) {
      return
    }
    setLoading(true)
    fetch('/setup/user', {
      method: 'put',
      body: JSON.stringify({ name: user.name, password }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(response => {
        setLoading(false)
        if (response.ok) {
          setUid(response.uid)
          onNext()
        } else {
          setError('La contraseña es incorrecta!')
        }
      })
  }

  return (
    <Card className={styles.card}>
      <CardHeader
        header={<Body1><b>Paso 2</b> (Contraseña)</Body1>}
      />
      <Body2>
        {
          user.existent
            ? <Body2>Por favor, ingresa la contraseña del usuario "{user.name}".</Body2>
            : <Body2>Por favor, ingresa la nueva contraseña para el usuario "{user.name}".</Body2>
        }
      </Body2>
      <Field
        label="Contraseña"
        required
        validationMessage={error}
      >
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          onBlur={() => setError('')}
        />
      </Field>
      {!user.existent && (
        <Field
          label="Confirmar contraseña"
          required
          validationMessage={password !== password2 ? "Las contraseñas no coinciden" : ''}
        >
          <Input
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            type="password"
          />
        </Field>
      )}
      <CardFooter className={styles.footer}>
        {!loading ? <Button onClick={onPrev}>Anterior</Button> : <p></p>}
        {loading
          ? <Spinner />
          : <Button onClick={handleOnClick}>Siguiente</Button>
        }
      </CardFooter>
    </Card>
  )
}

export default Password

interface PasswordProps {
  onPrev: () => void
  onNext: () => void
}