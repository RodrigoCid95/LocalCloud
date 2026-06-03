import { StrictMode, Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Avatar,
  Body1,
  Button,
  Caption1,
  Card,
  CardHeader,
  Divider,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Field,
  FluentProvider,
  Input,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Spinner,
  Subtitle2,
  Text,
  Toast,
  ToastBody,
  Toaster,
  ToastTitle,
  Title1,
  Title2,
  makeStaticStyles,
  makeStyles,
  mergeClasses,
  tokens,
  useId,
  useToastController,
  webDarkTheme,
  webLightTheme,
} from '@fluentui/react-components'
import {
  AppsRegular,
  DismissRegular,
  EditRegular,
  MailRegular,
  MoreHorizontal20Regular,
  NavigationRegular,
  PasswordRegular,
  PersonRegular,
  PhoneRegular,
  SaveRegular,
  SettingsRegular,
  SignOutRegular,
} from '@fluentui/react-icons'

import {
  defaultAppLaunchMode,
  isAppLaunchMode,
  preferencesKey,
  type AppLaunchMode,
  type DesktopPreferences,
} from './preferences'
import { playNewNotificationSound } from './notification-sound'

const SettingsDialog = lazy(() => import('./SettingsDialog'))

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
  shell: {
    width: '100vw',
    height: '100vh',
    display: 'grid',
    gridTemplateColumns: '320px minmax(0, 1fr)',
    backgroundColor: tokens.colorNeutralBackground2,
    backgroundImage: 'linear-gradient(135deg, rgba(0, 120, 212, .10), rgba(16, 124, 16, .07) 45%, rgba(196, 49, 75, .08))',
    color: tokens.colorNeutralForeground1,

    '@media (max-width: 820px)': {
      gridTemplateColumns: '1fr',
      gridTemplateRows: 'minmax(0, 1fr)',
      height: '100dvh',
      overflow: 'hidden',
    },
  },
  sidebar: {
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '28px',
    borderRightWidth: '1px',
    borderRightStyle: 'solid',
    borderRightColor: tokens.colorNeutralStroke2,
    backgroundColor: tokens.colorNeutralBackgroundAlpha,
    backdropFilter: 'blur(16px)',
    transitionDuration: tokens.durationNormal,
    transitionProperty: 'transform',
    transitionTimingFunction: tokens.curveEasyEase,

    '@media (max-width: 820px)': {
      width: 'min(86vw, 320px)',
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 2,
      padding: '20px',
      boxShadow: tokens.shadow28,
      transform: 'translateX(-105%)',
    },
  },
  sidebarOpen: {
    '@media (max-width: 820px)': {
      transform: 'translateX(0)',
    },
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  mobileCloseButton: {
    display: 'none',

    '@media (max-width: 820px)': {
      display: 'inline-flex',
    },
  },
  menuOverlay: {
    display: 'none',

    '@media (max-width: 820px)': {
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 1,
      display: 'block',
      backgroundColor: 'rgba(0, 0, 0, .38)',
    },
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  brandIcon: {
    width: '44px',
    height: '44px',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '8px',
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    fontSize: '24px',
  },
  profileCard: {
    width: '100%',
  },
  profileMeta: {
    display: 'grid',
    gap: '10px',
  },
  profileRow: {
    display: 'grid',
    gridTemplateColumns: '20px minmax(0, 1fr)',
    gap: '10px',
    alignItems: 'center',
    color: tokens.colorNeutralForeground2,
  },
  systemCard: {
    width: '100%',
  },
  systemMetrics: {
    display: 'grid',
    gap: '14px',
  },
  metricHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    color: tokens.colorNeutralForeground2,
  },
  meterTrack: {
    height: '8px',
    overflow: 'hidden',
    borderRadius: '8px',
    backgroundColor: tokens.colorNeutralBackground5,
  },
  meterFill: {
    height: '100%',
    borderRadius: '8px',
    backgroundColor: tokens.colorBrandBackground,
    transitionDuration: tokens.durationNormal,
    transitionProperty: 'width',
    transitionTimingFunction: tokens.curveEasyEase,
  },
  systemMeta: {
    color: tokens.colorNeutralForeground3,
  },
  powerActions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  truncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  spacer: {
    flex: 1,
  },
  sidebarFooter: {
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr)',
    gap: '8px',
    alignItems: 'center',
  },
  content: {
    minWidth: 0,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '22px',
    padding: '28px',
    overflow: 'auto',

    '@media (max-width: 820px)': {
      padding: '16px',
    },
  },
  mobileBar: {
    display: 'none',

    '@media (max-width: 820px)': {
      position: 'sticky',
      top: 0,
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      marginTop: '-16px',
      marginRight: '-16px',
      marginLeft: '-16px',
      paddingTop: '14px',
      paddingRight: '16px',
      paddingBottom: '14px',
      paddingLeft: '16px',
      backgroundColor: tokens.colorNeutralBackgroundAlpha,
      backdropFilter: 'blur(16px)',
      borderBottomWidth: '1px',
      borderBottomStyle: 'solid',
      borderBottomColor: tokens.colorNeutralStroke2,
    },
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  desktopActions: {
    '@media (max-width: 820px)': {
      display: 'none',
    },
  },
  appGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '14px',
  },
  appCard: {
    minHeight: '178px',
    justifyContent: 'space-between',
    transitionDuration: tokens.durationFaster,
    transitionProperty: 'border-color, box-shadow, transform',
    transitionTimingFunction: tokens.curveEasyEase,

    ':hover': {
      borderTopColor: tokens.colorBrandStroke1,
      borderRightColor: tokens.colorBrandStroke1,
      borderBottomColor: tokens.colorBrandStroke1,
      borderLeftColor: tokens.colorBrandStroke1,
      boxShadow: tokens.shadow16,
      transform: 'translateY(-2px)',
    },
  },
  appIcon: {
    width: '44px',
    height: '44px',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '8px',
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    fontSize: '24px',
  },
  appDescription: {
    minHeight: '44px',
    color: tokens.colorNeutralForeground2,
  },
  emptyState: {
    minHeight: '220px',
    display: 'grid',
    placeItems: 'center',
    textAlign: 'center',
    color: tokens.colorNeutralForeground2,
    borderTopWidth: '1px',
    borderRightWidth: '1px',
    borderBottomWidth: '1px',
    borderLeftWidth: '1px',
    borderTopStyle: 'dashed',
    borderRightStyle: 'dashed',
    borderBottomStyle: 'dashed',
    borderLeftStyle: 'dashed',
    borderTopColor: tokens.colorNeutralStroke1,
    borderRightColor: tokens.colorNeutralStroke1,
    borderBottomColor: tokens.colorNeutralStroke1,
    borderLeftColor: tokens.colorNeutralStroke1,
    borderRadius: '8px',
    backgroundColor: tokens.colorNeutralBackgroundAlpha,
  },
  center: {
    width: '100vw',
    height: '100vh',
    display: 'grid',
    placeItems: 'center',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  dialogForm: {
    display: 'grid',
    gap: '16px',
  },
  clickableToast: {
    cursor: 'pointer',
  },
})

const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')

const { data: dataApi, notifications: notificationsApi, profile: profileApi, system: systemApi } = window.sdk
type PasswordDialogMode = 'profile' | 'samba'
type SystemConnection = 'connecting' | 'connected' | 'error'
type PowerAction = 'shutdown' | 'reboot'

type ToastIntent = 'success' | 'error' | 'warning' | 'info'
type OpenAppNotificationAction = {
  packageName: string
  data?: Record<string, unknown>
}

const formatBytes = (bytes: number) => {
  if (bytes <= 0) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

const formatPercent = (value: number | undefined) => `${Math.round(value ?? 0)}%`

const clampPercent = (value: number | undefined) => Math.min(Math.max(value ?? 0, 0), 100)

const notificationIntent = (type: string): ToastIntent => {
  switch (type) {
    case 'success':
    case 'error':
    case 'warning':
    case 'info':
      return type
    default:
      return 'info'
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
)

const notificationOpenAppAction = (payload: unknown): OpenAppNotificationAction | undefined => {
  if (!isRecord(payload) || payload.action !== 'openApp') {
    return undefined
  }

  const packageName = typeof payload.packageName === 'string'
    ? payload.packageName
    : typeof payload.app === 'string' ? payload.app : ''
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(packageName)) {
    return undefined
  }

  return {
    packageName,
    data: isRecord(payload.data) ? payload.data : undefined,
  }
}

const appUrl = (packageName: string, data?: Record<string, unknown>) => {
  const url = new URL(`/app/${packageName}`, location.origin)
  if (data) {
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined || value === null) {
        continue
      }
      url.searchParams.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
    }
  }
  return `${url.pathname}${url.search}`
}

const Container = () => {
  useGlobalStyles()
  const styles = useStyles()
  const toasterId = useId('desktop-notifications')
  const { dismissToast, dispatchToast } = useToastController(toasterId)
  const [theme, setTheme] = useState(darkModeQuery.matches ? webDarkTheme : webLightTheme)
  const [profile, setProfile] = useState<LocalCloud.Profile | undefined>(undefined)
  const [apps, setApps] = useState<LocalCloud.App[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [signingOut, setSigningOut] = useState<boolean>(false)
  const [menuOpen, setMenuOpen] = useState<boolean>(false)
  const [systemStatus, setSystemStatus] = useState<LocalCloud.SystemStatus | undefined>(undefined)
  const [systemConnection, setSystemConnection] = useState<SystemConnection>('connecting')
  const [powerDialogAction, setPowerDialogAction] = useState<PowerAction | undefined>(undefined)
  const [powerActionPending, setPowerActionPending] = useState<boolean>(false)
  const [powerError, setPowerError] = useState<string>('')
  const [profileDialogOpen, setProfileDialogOpen] = useState<boolean>(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState<boolean>(false)
  const [savingProfile, setSavingProfile] = useState<boolean>(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState<boolean>(false)
  const [passwordDialogMode, setPasswordDialogMode] = useState<PasswordDialogMode>('profile')
  const [savingPassword, setSavingPassword] = useState<boolean>(false)
  const [passwordError, setPasswordError] = useState<string>('')
  const [passwordForm, setPasswordForm] = useState({
    password: '',
    confirmPassword: '',
  })
  const [appLaunchMode, setAppLaunchMode] = useState<AppLaunchMode>(defaultAppLaunchMode)
  const [profileForm, setProfileForm] = useState<LocalCloud.DataUser>({
    fullName: '',
    email: '',
    phone: '',
  })

  const loadDashboard = useCallback(() => {
    setLoading(true)
    setError('')

    Promise.all([profileApi.get(), profileApi.getApps()])
      .then(([userProfile, userApps]) => {
        setProfile(userProfile)
        setApps(userApps)
      })
      .catch(reason => {
        console.error(reason)
        setError('No se pudo cargar la informacion del escritorio.')
      })
      .finally(() => setLoading(false))
  }, [])

  const openProfileDialog = () => {
    if (!profile) {
      return
    }

    setProfileForm({
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
    })
    setProfileDialogOpen(true)
    setMenuOpen(false)
  }

  const openPasswordDialog = (mode: PasswordDialogMode = 'profile') => {
    setPasswordForm({
      password: '',
      confirmPassword: '',
    })
    setPasswordDialogMode(mode)
    setPasswordError('')
    setPasswordDialogOpen(true)
    setMenuOpen(false)
  }

  useEffect(() => {
    const handleThemeChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? webDarkTheme : webLightTheme)
    }

    darkModeQuery.addEventListener('change', handleThemeChange)
    return () => darkModeQuery.removeEventListener('change', handleThemeChange)
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  useEffect(() => {
    dataApi.user.get(preferencesKey)
      .then(preferences => {
        const desktopPreferences = preferences as DesktopPreferences | undefined

        if (isAppLaunchMode(desktopPreferences?.appLaunchMode ?? null)) {
          if (desktopPreferences?.appLaunchMode) {
            setAppLaunchMode(desktopPreferences.appLaunchMode)
          }
        }
      })
      .catch(reason => {
        console.error(reason)
      })
  }, [])

  useEffect(() => {
    setSystemConnection('connecting')
    const stream = systemApi.status(
      status => {
        setSystemStatus(status)
        setSystemConnection('connected')
      },
      {
        onError: () => setSystemConnection('error'),
      },
    )

    return () => stream.close()
  }, [])

  const handleOpenApp = useCallback((packageName: string, data?: Record<string, unknown>) => {
    const targetUrl = appUrl(packageName, data)

    if (appLaunchMode === 'same-tab') {
      location.href = targetUrl
      return
    }

    const openedWindow = appLaunchMode === 'new-window'
      ? window.open(targetUrl, '_blank', 'popup,width=1280,height=840')
      : window.open(targetUrl, '_blank')

    if (openedWindow) {
      openedWindow.opener = null
      return
    }

    location.href = targetUrl
  }, [appLaunchMode])

  useEffect(() => {
    if (!notificationsApi.stream) {
      return
    }

    const stream = notificationsApi.stream(notification => {
      if (document.visibilityState === 'visible') {
        playNewNotificationSound()
      }

      const openAppAction = notificationOpenAppAction(notification.payload)
      const toastId = notification.id
      const openNotificationApp = () => {
        dismissToast(toastId)
        if (openAppAction) {
          handleOpenApp(openAppAction.packageName, openAppAction.data)
        }
      }

      dispatchToast(
        <Toast
          className={openAppAction ? styles.clickableToast : undefined}
          tabIndex={openAppAction ? 0 : undefined}
          onClick={openAppAction ? openNotificationApp : undefined}
          onKeyDown={openAppAction ? event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              openNotificationApp()
            }
          } : undefined}
        >
          <ToastTitle>{notification.title || 'Notificacion'}</ToastTitle>
          {notification.message && (
            <ToastBody>{notification.message}</ToastBody>
          )}
        </Toast>,
        {
          intent: notificationIntent(notification.type),
          toastId,
        },
      )
    }, {
      onError: event => console.error(event),
    })

    return () => stream.close()
  }, [dismissToast, dispatchToast, handleOpenApp, styles.clickableToast])

  const updateAppLaunchMode = (launchMode: AppLaunchMode) => {
    setAppLaunchMode(launchMode)
    setError('')

    dataApi.user.set(preferencesKey, { appLaunchMode: launchMode }).catch(reason => {
      console.error(reason)
      setError('No se pudo guardar la preferencia de lanzamiento de aplicaciones.')
    })
  }

  const handleSignOut = () => {
    setSigningOut(true)
    fetch('/auth', { method: 'DELETE' })
      .then(() => location.reload())
      .catch(reason => {
        console.error(reason)
        setError('No se pudo cerrar la sesion.')
        setSigningOut(false)
      })
  }

  const openPowerDialog = (action: PowerAction) => {
    setPowerDialogAction(action)
    setPowerError('')
    setMenuOpen(false)
  }

  const handlePowerAction = () => {
    if (!powerDialogAction) {
      return
    }

    setPowerActionPending(true)
    setPowerError('')

    const runAction = powerDialogAction === 'shutdown'
      ? systemApi.shutdown
      : systemApi.reboot

    runAction()
      .catch(reason => {
        console.error(reason)
        setPowerError(powerDialogAction === 'shutdown'
          ? 'No se pudo solicitar el apagado del servidor.'
          : 'No se pudo solicitar el reinicio del servidor.')
        setPowerActionPending(false)
      })
  }

  const handleProfileSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSavingProfile(true)
    setError('')

    profileApi.update(profileForm)
      .then(() => profileApi.get())
      .then(updatedProfile => {
        setProfile(updatedProfile)
        setProfileDialogOpen(false)
      })
      .catch(reason => {
        console.error(reason)
        setError('No se pudo actualizar la informacion de perfil.')
      })
      .finally(() => setSavingProfile(false))
  }

  const handlePasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (passwordForm.password === '') {
      setPasswordError('La contraseña es requerida.')
      return
    }

    if (passwordForm.password !== passwordForm.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.')
      return
    }

    setSavingPassword(true)
    setPasswordError('')

    const updatePassword = passwordDialogMode === 'samba'
      ? profileApi.setSambaPassword
      : profileApi.setPassword

    updatePassword(passwordForm.password)
      .then(() => {
        setPasswordDialogOpen(false)
        setPasswordForm({
          password: '',
          confirmPassword: '',
        })
      })
      .catch(reason => {
        console.error(reason)
        setPasswordError(passwordDialogMode === 'samba'
          ? 'No se pudo actualizar la contraseña de Samba.'
          : 'No se pudo actualizar la contraseña.')
      })
      .finally(() => setSavingPassword(false))
  }

  return (
    <StrictMode>
      <FluentProvider theme={theme}>
        <Toaster toasterId={toasterId} position="top-end" />
        {loading ? (
          <div className={styles.center}>
            <Spinner size="huge" label="Cargando escritorio" />
          </div>
        ) : (
          <main className={styles.shell}>
            {menuOpen && <div className={styles.menuOverlay} onClick={() => setMenuOpen(false)} />}

            <aside className={mergeClasses(styles.sidebar, menuOpen && styles.sidebarOpen)}>
              <div className={styles.sidebarHeader}>
                <div className={styles.brand}>
                  <div className={styles.brandIcon}>
                    <AppsRegular />
                  </div>
                  <div>
                    <Title2>LocalCloud</Title2>
                    <br />
                    <Caption1>Escritorio</Caption1>
                  </div>
                </div>
                <Button
                  appearance="transparent"
                  aria-label="Cerrar menu"
                  className={styles.mobileCloseButton}
                  icon={<DismissRegular />}
                  onClick={() => setMenuOpen(false)}
                />
              </div>

              {profile && (
                <Card className={styles.profileCard}>
                  <CardHeader
                    image={<Avatar name={profile.fullName || profile.name} color="colorful" />}
                    header={<Subtitle2>{profile.fullName || profile.name}</Subtitle2>}
                    description={<Caption1>@{profile.name} · UID {profile.uid}</Caption1>}
                    action={(
                      <Menu>
                        <MenuTrigger disableButtonEnhancement>
                          <Button
                            appearance="transparent"
                            icon={<MoreHorizontal20Regular />}
                            aria-label="Opciones de perfil"
                          />
                        </MenuTrigger>
                        <MenuPopover>
                          <MenuList>
                            <MenuItem icon={<EditRegular />} onClick={openProfileDialog}>
                              Editar perfil
                            </MenuItem>
                            <MenuItem icon={<PasswordRegular />} onClick={() => openPasswordDialog()}>
                              Contraseña
                            </MenuItem>
                            {profile.belongsToSamba && (
                              <MenuItem icon={<PasswordRegular />} onClick={() => openPasswordDialog('samba')}>
                                Contraseña Samba
                              </MenuItem>
                            )}
                          </MenuList>
                        </MenuPopover>
                      </Menu>
                    )}
                  />
                  <Divider />
                  <div className={styles.profileMeta}>
                    <div className={styles.profileRow}>
                      <PersonRegular />
                      <Text className={styles.truncate}>{profile.fullName || 'Sin nombre completo'}</Text>
                    </div>
                    <div className={styles.profileRow}>
                      <MailRegular />
                      <Text className={styles.truncate}>{profile.email || 'Sin correo registrado'}</Text>
                    </div>
                    <div className={styles.profileRow}>
                      <PhoneRegular />
                      <Text className={styles.truncate}>{profile.phone || 'Sin telefono registrado'}</Text>
                    </div>
                  </div>
                </Card>
              )}

              <Card className={styles.systemCard}>
                <CardHeader
                  header={<Subtitle2>Estado del sistema</Subtitle2>}
                  description={(
                    <Caption1>
                      {systemConnection === 'connected' && 'Actualizando en vivo'}
                      {systemConnection === 'connecting' && 'Conectando al servidor'}
                      {systemConnection === 'error' && 'Reconectando al servidor'}
                    </Caption1>
                  )}
                />
                <div className={styles.systemMetrics}>
                  <div>
                    <div className={styles.metricHeader}>
                      <Caption1>CPU</Caption1>
                      <Caption1>{formatPercent(systemStatus?.cpu.usagePercent)}</Caption1>
                    </div>
                    <div
                      className={styles.meterTrack}
                      role="progressbar"
                      aria-label="Uso de CPU"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={clampPercent(systemStatus?.cpu.usagePercent)}
                    >
                      <div
                        className={styles.meterFill}
                        style={{ width: `${clampPercent(systemStatus?.cpu.usagePercent)}%` }}
                      />
                    </div>
                    <Caption1 className={styles.systemMeta}>
                      {systemStatus ? `${systemStatus.cpu.cores} nucleos` : 'Esperando datos'}
                    </Caption1>
                  </div>

                  <div>
                    <div className={styles.metricHeader}>
                      <Caption1>RAM</Caption1>
                      <Caption1>{formatPercent(systemStatus?.ram.usagePercent)}</Caption1>
                    </div>
                    <div
                      className={styles.meterTrack}
                      role="progressbar"
                      aria-label="Uso de RAM"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={clampPercent(systemStatus?.ram.usagePercent)}
                    >
                      <div
                        className={styles.meterFill}
                        style={{ width: `${clampPercent(systemStatus?.ram.usagePercent)}%` }}
                      />
                    </div>
                    <Caption1 className={styles.systemMeta}>
                      {systemStatus
                        ? `${formatBytes(systemStatus.ram.usedBytes)} de ${formatBytes(systemStatus.ram.totalBytes)}`
                        : 'Esperando datos'}
                    </Caption1>
                  </div>
                </div>

                <Divider />

                <div className={styles.powerActions}>
                  <Button
                    appearance="secondary"
                    disabled={powerActionPending}
                    onClick={() => openPowerDialog('reboot')}
                  >
                    Reiniciar
                  </Button>
                  <Button
                    appearance="secondary"
                    disabled={powerActionPending}
                    onClick={() => openPowerDialog('shutdown')}
                  >
                    Apagar
                  </Button>
                </div>
              </Card>

              <div className={styles.spacer} />

              <div className={styles.sidebarFooter}>
                <Button
                  appearance="secondary"
                  aria-label="Abrir ajustes"
                  icon={<SettingsRegular />}
                  onClick={() => setSettingsDialogOpen(true)}
                />
                <Button
                  appearance="secondary"
                  icon={<SignOutRegular />}
                  onClick={handleSignOut}
                  disabled={signingOut}
                >
                  {signingOut ? 'Cerrando sesion' : 'Cerrar sesion'}
                </Button>
              </div>
            </aside>

            <section className={styles.content}>
              <div className={styles.mobileBar}>
                <Button
                  appearance="transparent"
                  aria-label="Abrir menu"
                  icon={<NavigationRegular />}
                  onClick={() => setMenuOpen(true)}
                />
                <Subtitle2>LocalCloud</Subtitle2>
                <Button onClick={loadDashboard}>Actualizar</Button>
              </div>

              <div className={styles.header}>
                <div>
                  <Title1>Aplicaciones</Title1>
                  <br />
                  <Body1>Selecciona una app para abrirla en LocalCloud.</Body1>
                </div>
                <Button className={styles.desktopActions} onClick={loadDashboard}>Actualizar</Button>
              </div>

              {error && (
                <MessageBar intent="error" layout="multiline">
                  <MessageBarBody>
                    <MessageBarTitle>Error</MessageBarTitle>
                    {error}
                  </MessageBarBody>
                </MessageBar>
              )}

              {apps.length === 0 ? (
                <div className={styles.emptyState}>
                  <div>
                    <Subtitle2>No tienes aplicaciones asignadas.</Subtitle2>
                    <br />
                    <Body1>Cuando se te asignen apps apareceran aqui.</Body1>
                  </div>
                </div>
              ) : (
                <div className={styles.appGrid}>
                  {apps.map(app => (
                    <Card key={app.packageName} className={styles.appCard} onClick={() => handleOpenApp(app.packageName)}>
                      <CardHeader
                        image={
                          <div className={styles.appIcon}>
                            <AppsRegular />
                          </div>
                        }
                        header={<Subtitle2>{app.title}</Subtitle2>}
                        description={<Caption1>{app.author || app.packageName}</Caption1>}
                      />
                      <Text className={mergeClasses(styles.appDescription, styles.truncate)}>
                        {app.description || 'Aplicacion de LocalCloud'}
                      </Text>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <Dialog
              open={profileDialogOpen}
              onOpenChange={(_, data) => !savingProfile && setProfileDialogOpen(data.open)}
            >
              <DialogSurface>
                <form onSubmit={handleProfileSubmit}>
                  <DialogBody>
                    <DialogTitle>Editar perfil</DialogTitle>
                    <DialogContent>
                      <div className={styles.dialogForm}>
                        <Field label="Nombre completo">
                          <Input
                            value={profileForm.fullName}
                            contentBefore={<PersonRegular />}
                            disabled={savingProfile}
                            onChange={(_, data) => setProfileForm(current => ({
                              ...current,
                              fullName: data.value,
                            }))}
                          />
                        </Field>
                        <Field label="Correo">
                          <Input
                            value={profileForm.email}
                            type="email"
                            contentBefore={<MailRegular />}
                            disabled={savingProfile}
                            onChange={(_, data) => setProfileForm(current => ({
                              ...current,
                              email: data.value,
                            }))}
                          />
                        </Field>
                        <Field label="Telefono">
                          <Input
                            value={profileForm.phone}
                            type="tel"
                            contentBefore={<PhoneRegular />}
                            disabled={savingProfile}
                            onChange={(_, data) => setProfileForm(current => ({
                              ...current,
                              phone: data.value,
                            }))}
                          />
                        </Field>
                      </div>
                    </DialogContent>
                    <DialogActions>
                      <Button
                        appearance="secondary"
                        disabled={savingProfile}
                        onClick={() => setProfileDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        appearance="primary"
                        disabled={savingProfile}
                        icon={savingProfile ? undefined : <SaveRegular />}
                        type="submit"
                      >
                        {savingProfile ? <Spinner size="tiny" label="Guardando" /> : 'Guardar'}
                      </Button>
                    </DialogActions>
                  </DialogBody>
                </form>
              </DialogSurface>
            </Dialog>

            {settingsDialogOpen && (
              <Suspense fallback={null}>
                <SettingsDialog
                  appLaunchMode={appLaunchMode}
                  open={settingsDialogOpen}
                  onAppLaunchModeChange={updateAppLaunchMode}
                  onOpenChange={setSettingsDialogOpen}
                />
              </Suspense>
            )}

            <Dialog
              open={passwordDialogOpen}
              onOpenChange={(_, data) => !savingPassword && setPasswordDialogOpen(data.open)}
            >
              <DialogSurface>
                <form onSubmit={handlePasswordSubmit}>
                  <DialogBody>
                    <DialogTitle>
                      {passwordDialogMode === 'samba' ? 'Actualizar contraseña Samba' : 'Actualizar contraseña'}
                    </DialogTitle>
                    <DialogContent>
                      <div className={styles.dialogForm}>
                        {passwordError && (
                          <MessageBar intent="error" layout="multiline">
                            <MessageBarBody>
                              <MessageBarTitle>Error</MessageBarTitle>
                              {passwordError}
                            </MessageBarBody>
                          </MessageBar>
                        )}
                        <Field label="Nueva contraseña" required>
                          <Input
                            value={passwordForm.password}
                            type="password"
                            contentBefore={<PasswordRegular />}
                            disabled={savingPassword}
                            onChange={(_, data) => {
                              setPasswordForm(current => ({
                                ...current,
                                password: data.value,
                              }))
                              setPasswordError('')
                            }}
                          />
                        </Field>
                        <Field label="Confirmar contraseña" required>
                          <Input
                            value={passwordForm.confirmPassword}
                            type="password"
                            contentBefore={<PasswordRegular />}
                            disabled={savingPassword}
                            onChange={(_, data) => {
                              setPasswordForm(current => ({
                                ...current,
                                confirmPassword: data.value,
                              }))
                              setPasswordError('')
                            }}
                          />
                        </Field>
                      </div>
                    </DialogContent>
                    <DialogActions>
                      <Button
                        appearance="secondary"
                        disabled={savingPassword}
                        onClick={() => setPasswordDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        appearance="primary"
                        disabled={savingPassword}
                        icon={savingPassword ? undefined : <SaveRegular />}
                        type="submit"
                      >
                        {savingPassword ? <Spinner size="tiny" label="Guardando" /> : 'Guardar'}
                      </Button>
                    </DialogActions>
                  </DialogBody>
                </form>
              </DialogSurface>
            </Dialog>

            <Dialog
              open={powerDialogAction !== undefined}
              onOpenChange={(_, data) => !powerActionPending && setPowerDialogAction(data.open ? powerDialogAction : undefined)}
            >
              <DialogSurface>
                <DialogBody>
                  <DialogTitle>
                    {powerDialogAction === 'shutdown' ? 'Apagar servidor' : 'Reiniciar servidor'}
                  </DialogTitle>
                  <DialogContent>
                    <div className={styles.dialogForm}>
                      {powerError && (
                        <MessageBar intent="error" layout="multiline">
                          <MessageBarBody>
                            <MessageBarTitle>Error</MessageBarTitle>
                            {powerError}
                          </MessageBarBody>
                        </MessageBar>
                      )}
                      <Body1>
                        {powerDialogAction === 'shutdown'
                          ? 'El sistema se apagara y las sesiones activas se interrumpiran.'
                          : 'El sistema se reiniciara y las sesiones activas se interrumpiran temporalmente.'}
                      </Body1>
                    </div>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      appearance="secondary"
                      disabled={powerActionPending}
                      onClick={() => setPowerDialogAction(undefined)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      appearance="primary"
                      disabled={powerActionPending}
                      onClick={handlePowerAction}
                    >
                      {powerActionPending
                        ? <Spinner size="tiny" label="Enviando solicitud" />
                        : powerDialogAction === 'shutdown' ? 'Apagar' : 'Reiniciar'}
                    </Button>
                  </DialogActions>
                </DialogBody>
              </DialogSurface>
            </Dialog>
          </main>
        )}
      </FluentProvider>
    </StrictMode>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(<Container />)
