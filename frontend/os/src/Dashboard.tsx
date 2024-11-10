import { useEffect, useState } from "react"
import { Card, CardHeader, Dialog, Text, DialogBody, DialogContent, DialogSurface, DialogTitle, Caption1, Spinner, Toolbar, ToolbarButton, ToolbarDivider, Field, Input, DialogActions, Button, tokens, makeStyles } from "@fluentui/react-components"
import { TableFilled, PersonFilled, KeyMultipleFilled, ArrowExitFilled, Apps28Filled } from '@fluentui/react-icons'

const useStyles = makeStyles({
  form: {
    display: "flex",
    flexDirection: "column",
    rowGap: tokens.spacingVerticalL,
  },
  apps: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacingHorizontalL
  },
  app: {
    width: "100%",
    height: "fit-content",
    '@media (min-width: 612px)': {
      maxWidth: "266px"
    }
  },
  caption: {
    color: tokens.colorNeutralForeground3
  },
  text: {
    margin: 0
  },
})

const Dashboard = () => {
  const styles = useStyles()
  const mediaQuery = window.matchMedia('(max-width: 560px)')
  const [verticalToolbar, setVerticalToolbar] = useState<boolean>(mediaQuery.matches)

  const [appsLoading, setAppsLoading] = useState<boolean>(false)
  const [profileLoading, setProfileLoading] = useState<boolean>(false)
  const [logoutLoading, setLogoutLoading] = useState<boolean>(false)

  const [openAppsModal, setOpenAppsModal] = useState<boolean>(false)
  const [apps, setApps] = useState<Apps.App[]>([])

  const [openProfileModal, setOpenProfileModal] = useState<boolean>(false)
  const [name, setName] = useState<string>('')
  const [full_name, setFullName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [profileSaveLoading, setProfileSaveLoading] = useState<boolean>(false)

  const [openUpdatePassword, setOpenUpdatePassword] = useState<boolean>(false)
  const [password, setPassword] = useState<string>('')
  const [newPassword1, setNewPassword1] = useState<string>('')
  const [newPassword2, setNewPassword2] = useState<string>('')
  const [passwordNotMatch, setPasswordsNotMatch] = useState<boolean>(true)
  const [passwordValidation, setPasswordValidation] = useState<string>('')
  const [updatePasswordLoading, setUpdatePasswordLoading] = useState<boolean>(false)

  useEffect(() => {
    mediaQuery.addEventListener('change', e => setVerticalToolbar(e.matches))
  }, [setVerticalToolbar])

  const handleApps = async () => {
    setAppsLoading(true)
    try {
      const listApps = await window.connectors.profile.listApps()
      console.log(listApps)
      setApps(listApps)
    } catch (error) {
      console.error(error)
    }
    setAppsLoading(false)
    setOpenAppsModal(true)
  }

  const handleLaunchApp = (app: Apps.App) => () => window.launchApp(app.package_name)

  const handleProfile = async () => {
    setProfileLoading(true)
    try {
      const profile = await window.connectors.profile.info()
      setName(profile.name)
      setFullName(profile.full_name)
      setEmail(profile.email)
      setPhone(profile.phone)
      setOpenProfileModal(true)
    } catch (error) {
      console.error(error)
    }
    setProfileLoading(false)
  }

  const handleSaveProfile = async () => {
    setProfileSaveLoading(true)
    try {
      await window.connectors.profile.update({ name, full_name, email, phone })
    } catch (error) {
      console.error(error)
    }
    setProfileSaveLoading(false)
  }

  const handleSaveUpdatePassword = async () => {
    if (!passwordNotMatch || !password || !newPassword1 || !newPassword2) {
      return
    }
    setUpdatePasswordLoading(true)
    try {
      const response = await window.connectors.profile.updatePassword({
        current_password: password,
        new_password: newPassword1
      })
      if (!response.ok) {
        setPasswordValidation(response.message)
      }
    } catch (error) {
      console.error(error)
    }
    setUpdatePasswordLoading(false)
  }

  const handleLogout = () => {
    setLogoutLoading(true);
    (window.connectors.auth.logOut as Auth.LogOutMethod)().then(() => window.location.reload())
  }

  return (
    <>
      <Dialog
        modalType="non-modal"
        open={openAppsModal}
        onOpenChange={(_, data) => setOpenAppsModal(data.open)}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Apps</DialogTitle>
            <DialogContent className={styles.apps}>
              {apps.length === 0 && <p>No hay apps.</p>}
              {apps.map((app, index) => (
                <Card
                  key={index}
                  className={styles.app}
                  onClick={handleLaunchApp(app)}
                >
                  <CardHeader
                    image={<Apps28Filled />}
                    header={<Text weight="semibold">{app.title}</Text>}
                    description={
                      <Caption1 className={styles.caption}>{app.author}</Caption1>
                    }
                  />
                  <p className={styles.text}>{app.description}</p>
                </Card>
              ))}
            </DialogContent>
          </DialogBody>
        </DialogSurface>
      </Dialog>
      <Dialog
        modalType="non-modal"
        open={openProfileModal}
        onOpenChange={(_, data) => !data.open && !profileSaveLoading && setOpenProfileModal(false)}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Perfil</DialogTitle>
            <DialogContent>
              <div className={styles.form}>
                <Field
                  label='Nombre de usuario'
                >
                  <Input
                    type="text"
                    disabled={true}
                    value={name}
                  />
                </Field>
                <Field
                  label='Nombre completo'
                >
                  <Input
                    type="text"
                    value={full_name}
                    disabled={profileSaveLoading}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </Field>
                <Field
                  label='Correo electrónico'
                >
                  <Input
                    type="email"
                    value={email}
                    disabled={profileSaveLoading}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
                <Field
                  label='Teléfono'
                >
                  <Input
                    type="tel"
                    value={phone}
                    disabled={profileSaveLoading}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Field>
              </div>
            </DialogContent>
            <DialogActions>
              {
                profileSaveLoading
                  ? <Spinner />
                  : <Button appearance="primary" onClick={handleSaveProfile}>Guardar</Button>
              }
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
      <Dialog
        modalType="non-modal"
        open={openUpdatePassword}
        onOpenChange={(_, data) => !data.open && !updatePasswordLoading && setOpenUpdatePassword(false)}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Cambiar contraseña</DialogTitle>
            <DialogContent>
              <div className={styles.form}>
                <Field
                  label='Contraseña actual'
                  validationState={passwordValidation === '' ? 'none' : 'error'}
                  validationMessage={passwordValidation}
                >
                  <Input
                    type="password"
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value)
                      setPasswordValidation('')
                    }}
                  />
                </Field>
                <Field
                  label='Nueva contraseña'
                >
                  <Input
                    type="password"
                    value={newPassword1}
                    onChange={e => setNewPassword1(e.target.value)}
                  />
                </Field>
                <Field
                  label='Repite la nueva contraseña'
                  validationState={passwordNotMatch ? 'none' : 'error'}
                  validationMessage={passwordNotMatch ? '' : 'Las contraseñas no coinciden.'}
                >
                  <Input
                    type="password"
                    value={newPassword2}
                    onChange={e => setNewPassword2(e.target.value)}
                    onBlur={() => setPasswordsNotMatch(newPassword1 === newPassword2)}
                  />
                </Field>
              </div>
            </DialogContent>
            <DialogActions>
              {
                updatePasswordLoading
                  ? <Spinner />
                  : <Button appearance="primary" onClick={handleSaveUpdatePassword}>Cambiar</Button>
              }
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
      <Toolbar vertical={verticalToolbar} size='large'>
        {
          !appsLoading
            ? (
              <ToolbarButton
                icon={<TableFilled />}
                vertical
                onClick={handleApps}
              >
                Apps
              </ToolbarButton>
            )
            : <Spinner />
        }
        {
          !profileLoading
            ? (
              <ToolbarButton
                icon={<PersonFilled />}
                vertical
                onClick={handleProfile}
              >
                Perfil
              </ToolbarButton>
            )
            : <Spinner />
        }
        <ToolbarButton
          icon={<KeyMultipleFilled />}
          vertical
          onClick={() => setOpenUpdatePassword(true)}
        >
          Cambiar contraseña
        </ToolbarButton>
        <ToolbarDivider />
        {
          !logoutLoading
            ? (
              <ToolbarButton
                icon={<ArrowExitFilled />}
                vertical
                onClick={handleLogout}
              >
                Cerrar sesión
              </ToolbarButton>
            )
            : <Spinner />
        }
      </Toolbar>
    </>
  )
}

export default Dashboard