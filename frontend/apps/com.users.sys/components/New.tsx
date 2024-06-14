import { type FC, useCallback, useState } from 'react'
import { Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, Field, Input, DialogActions, DialogTrigger, Button, Spinner } from '@fluentui/react-components'

const New: FC<NewProps> = ({ open, onClose, onSave }) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [name, setName] = useState<Users.User['name']>('')
  const [full_name, setFullName] = useState<Users.User['full_name']>('')
  const [email, setEmail] = useState<Users.User['email']>('')
  const [phone, setPhone] = useState<Users.User['phone']>('')
  const [password, setPassword] = useState<string>('')
  const [nameVerification, setNameVerification] = useState<Verification>({})
  const [fullNameVerification, setFullNameVerification] = useState<Verification>({})
  const [passwordVerification, setPasswordVerification] = useState<Verification>({})

  const handleSave = useCallback(() => {
    if (!name) {
      setNameVerification({ message: 'Campo requerido.', state: 'warning' })
      return
    }
    if (!full_name) {
      setFullNameVerification({ message: 'Campo requerido.', state: 'warning' })
      return
    }
    if (!password) {
      setPasswordVerification({ message: 'Campo requerido.', state: 'warning' })
      return
    }
    setLoading(true)
    window.connectors.users.create({ name, password, full_name, email, phone })
      .then(response => {
        setLoading(false)
        if (typeof response === 'object' && response.code) {
          const message = response.code === 'user-already-exists' ? 'Este usuario ya existe.' : 'No se puede crear el usuario.'
          setNameVerification({ message, state: 'error' })
          return
        }
        onSave()
      })
  }, [name, setNameVerification, full_name, setFullNameVerification, email, phone, password, setPasswordVerification, setLoading, onSave])

  return (
    <Dialog
      open={open}
      onOpenChange={(_, data) => {
        if (!data.open) {
          setName('')
          setFullName('')
          setEmail('')
          setPhone('')
          setPassword('')
          onClose()
        }
      }}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Crear usuario</DialogTitle>
          <DialogContent>
            <Field
              label="Nombre de usuario"
              validationState={nameVerification.state}
              validationMessage={nameVerification.message}
            >
              <Input value={name} onChange={e => setName(e.target.value)} onBlur={() => setNameVerification({})} />
            </Field>
            <Field
              label="Nombre completo"
              validationState={fullNameVerification.state}
              validationMessage={fullNameVerification.message}
            >
              <Input value={full_name} onChange={e => setFullName(e.target.value)} onBlur={(() => setFullNameVerification({}))} />
            </Field>
            <Field
              label="Correo electrónico"
            >
              <Input value={email} onChange={e => setEmail(e.target.value)} />
            </Field>
            <Field
              label="Teléfono"
            >
              <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
            </Field>
            <Field
              label="Contraseña"
              validationState={passwordVerification.state}
              validationMessage={passwordVerification.message}
            >
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} onBlur={() => setPasswordVerification({})} />
            </Field>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">Cancelar</Button>
            </DialogTrigger>
            {
              loading
                ? <Spinner />
                : <Button appearance="primary" onClick={handleSave}>Crear</Button>
            }
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

interface Verification {
  message?: string
  state?: 'error' | 'warning' | 'success' | 'none'
}
interface NewProps {
  open: boolean
  onClose(): void
  onSave(): void
}

export default New