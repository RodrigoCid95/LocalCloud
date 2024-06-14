import { type FC, useCallback, useState } from "react"
import { Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, Field, Input, DialogActions, DialogTrigger, Button, Spinner } from "@fluentui/react-components"

const Form: FC<FormProps> = ({ user, onFullNameChange, onEmailChange, onPhoneChange }) => {
  const [full_name, setFullName] = useState<Users.User['full_name']>(user.full_name)
  const [email, setEmail] = useState<Users.User['email']>(user.email)
  const [phone, setPhone] = useState<Users.User['phone']>(user.phone)

  return (
    <DialogContent>
      <Field label="Nombre completo">
        <Input value={full_name} onChange={e => {
          const value = e.target.value
          setFullName(value)
          onFullNameChange(value)
        }} />
      </Field>
      <Field label="Correo electrónico">
        <Input value={email} onChange={e => {
          const value = e.target.value
          setEmail(value)
          onEmailChange(value)
        }} />
      </Field>
      <Field label="Teléfono">
        <Input type="tel" value={phone} onChange={e => {
          const value = e.target.value
          setPhone(value)
          onPhoneChange(value)
        }} />
      </Field>
    </DialogContent >
  )
}

interface FormProps {
  user: Users.User
  onFullNameChange(value: string): void
  onEmailChange(value: string): void
  onPhoneChange(value: string): void
}

const Edit: FC<EditProps> = ({ user, onSave, onClose }) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [full_name, setFullName] = useState<Users.User['full_name']>('')
  const [email, setEmail] = useState<Users.User['email']>('')
  const [phone, setPhone] = useState<Users.User['phone']>('')

  const handleSave = useCallback(() => {
    if (user) {
      setLoading(true)
      window.connectors.users.update(user.uid, { full_name: full_name || user.full_name, email: email || user.email, phone: phone || user.phone })
        .then(() => {
          setLoading(false)
          onSave()
        })
    }
  }, [user, full_name, email, phone, setLoading, onSave])

  return (
    <Dialog
      open={user !== undefined}
      onOpenChange={(_, data) => {
        if (!data.open) {
          onClose()
        }
      }}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Editar usuario - {user?.name}</DialogTitle>
          {user && (
            <Form
              user={user}
              onFullNameChange={value => setFullName(value)}
              onEmailChange={value => setEmail(value)}
              onPhoneChange={value => setPhone(value)}
            />
          )}
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

interface EditProps {
  user: Users.User | undefined
  onSave(): void
  onClose(): void
}

export default Edit