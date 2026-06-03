import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Body1,
  Button,
  Caption1,
  Card,
  CardFooter,
  CardHeader,
  Divider,
  Field,
  FluentProvider,
  Input,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  MessageBarTitle,
  Spinner,
  Subtitle2,
  Title1,
  Title2,
  makeStaticStyles,
  makeStyles,
  tokens,
  webDarkTheme,
  webLightTheme,
} from '@fluentui/react-components'
import {
  ArrowEnterRegular,
  CloudRegular,
  DismissRegular,
  LockClosedRegular,
  PersonRegular,
  ShieldKeyholeRegular,
} from '@fluentui/react-icons'

const useGlobalStyles = makeStaticStyles({
  '*': {
    padding: '0',
    margin: '0',
    boxSizing: 'border-box',
    userSelect: 'none',
  },
  body: {
    minWidth: '100vw',
    minHeight: '100vh',
    overflow: 'hidden',
    backgroundColor: '#f4f7fb',

    '@media (prefers-color-scheme: dark)': {
      backgroundColor: '#111827',
    },
  },
  '#root': {
    display: 'contents',
  },
})

const useStyles = makeStyles({
  page: {
    width: '100vw',
    minHeight: '100vh',
    display: 'grid',
    gridTemplateColumns: 'minmax(360px, 470px) minmax(0, 1fr)',
    backgroundColor: tokens.colorNeutralBackground2,
    backgroundImage: 'linear-gradient(135deg, rgba(0, 120, 212, .11), rgba(16, 124, 16, .08) 48%, rgba(196, 49, 75, .08))',
    color: tokens.colorNeutralForeground1,

    '@media (max-width: 860px)': {
      gridTemplateColumns: '1fr',
      minHeight: '100dvh',
      overflow: 'auto',
    },
  },
  formSide: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '24px',
    paddingTop: '36px',
    paddingRight: '36px',
    paddingBottom: '36px',
    paddingLeft: '36px',
    backgroundColor: tokens.colorNeutralBackgroundAlpha,
    backdropFilter: 'blur(16px)',
    borderRightWidth: '1px',
    borderRightStyle: 'solid',
    borderRightColor: tokens.colorNeutralStroke2,

    '@media (max-width: 860px)': {
      minHeight: '100dvh',
      alignItems: 'center',
      paddingTop: '24px',
      paddingRight: '20px',
      paddingBottom: '24px',
      paddingLeft: '20px',
      borderRightWidth: '0',
    },
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  brandIcon: {
    width: '48px',
    height: '48px',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '8px',
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    fontSize: '26px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
  },
  fieldStack: {
    display: 'grid',
    gap: '16px',
  },
  submitRow: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  submitButton: {
    minWidth: '132px',
  },
  alert: {
    maxWidth: '100%',
  },
  featureSide: {
    minWidth: 0,
    minHeight: '100vh',
    display: 'grid',
    alignContent: 'center',
    gap: '28px',
    paddingTop: '44px',
    paddingRight: '56px',
    paddingBottom: '44px',
    paddingLeft: '56px',

    '@media (max-width: 860px)': {
      display: 'none',
    },
  },
  heroText: {
    maxWidth: '680px',
    display: 'grid',
    gap: '12px',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '14px',
    maxWidth: '780px',
  },
  featureCard: {
    minHeight: '132px',
    backgroundColor: tokens.colorNeutralBackgroundAlpha,
  },
  featureIcon: {
    width: '40px',
    height: '40px',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '8px',
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    fontSize: '22px',
  },
})

const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')

const Container = () => {
  useGlobalStyles()
  const styles = useStyles()
  const [theme, setTheme] = useState(darkModeQuery.matches ? webDarkTheme : webLightTheme)
  const [error, setError] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const handleThemeChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? webDarkTheme : webLightTheme)
    }

    darkModeQuery.addEventListener('change', handleThemeChange)
    return () => darkModeQuery.removeEventListener('change', handleThemeChange)
  }, [])

  const handleOnSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(false)
    setLoading(true)

    const form = event.currentTarget
    const formData = new FormData(form)
    const credentials = {
      user_name: String(formData.get('user-name') || ''),
      password: String(formData.get('password') || ''),
    }

    fetch('/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })
      .then(response => {
        if (response.status !== 200) {
          setError(true)
          setLoading(false)
          return
        }

        location.reload()
      })
      .catch(reason => {
        setLoading(false)
        setError(true)
        console.error(reason)
      })
  }

  return (
    <StrictMode>
      <FluentProvider theme={theme}>
        <main className={styles.page}>
          <section className={styles.formSide}>
            <div className={styles.brand}>
              <div className={styles.brandIcon}>
                <CloudRegular />
              </div>
              <div>
                <Title2>LocalCloud</Title2>
                <br />
                <Caption1>Acceso seguro</Caption1>
              </div>
            </div>

            <form onSubmit={handleOnSubmit}>
              <Card className={styles.card}>
                <CardHeader
                  header={<Title1>Iniciar sesion</Title1>}
                  description={<Body1>Entra a tu escritorio y aplicaciones asignadas.</Body1>}
                />
                <Divider />

                {error && (
                  <MessageBar intent="error" className={styles.alert} layout="multiline">
                    <MessageBarBody>
                      <MessageBarTitle>Credenciales incorrectas.</MessageBarTitle>
                      El nombre de usuario o la contraseña no coinciden.
                    </MessageBarBody>
                    <MessageBarActions
                      containerAction={
                        <Button
                          onClick={() => setError(false)}
                          aria-label="Cerrar alerta"
                          appearance="transparent"
                          icon={<DismissRegular />}
                        />
                      }
                    />
                  </MessageBar>
                )}

                <div className={styles.fieldStack}>
                  <Field label="Nombre de usuario" required>
                    <Input
                      name="user-name"
                      autoComplete="username"
                      contentBefore={<PersonRegular />}
                      disabled={loading}
                      required
                    />
                  </Field>

                  <Field label="Contraseña" required>
                    <Input
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      contentBefore={<LockClosedRegular />}
                      disabled={loading}
                      required
                    />
                  </Field>
                </div>

                <CardFooter>
                  <div className={styles.submitRow}>
                    <Button
                      appearance="primary"
                      className={styles.submitButton}
                      disabled={loading}
                      icon={loading ? undefined : <ArrowEnterRegular />}
                      type="submit"
                    >
                      {loading ? <Spinner size="tiny" label="Entrando" /> : 'Entrar'}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </form>
          </section>

          <section className={styles.featureSide}>
            <div className={styles.heroText}>
              <Title1>Tu nube local, lista para trabajar.</Title1>
              <Body1>
                Accede a tus herramientas, archivos y administracion desde un escritorio privado.
              </Body1>
            </div>

            <div className={styles.featureGrid}>
              <Card className={styles.featureCard}>
                <CardHeader
                  image={
                    <div className={styles.featureIcon}>
                      <ShieldKeyholeRegular />
                    </div>
                  }
                  header={<Subtitle2>Sesion protegida</Subtitle2>}
                  description={<Caption1>Autenticacion centralizada para tus apps.</Caption1>}
                />
              </Card>
              <Card className={styles.featureCard}>
                <CardHeader
                  image={
                    <div className={styles.featureIcon}>
                      <PersonRegular />
                    </div>
                  }
                  header={<Subtitle2>Perfil personal</Subtitle2>}
                  description={<Caption1>Tus datos y permisos viajan contigo.</Caption1>}
                />
              </Card>
            </div>
          </section>
        </main>
      </FluentProvider>
    </StrictMode>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(<Container />)
