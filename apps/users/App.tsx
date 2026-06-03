import { StrictMode, Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Body1,
  Button,
  Caption1,
  FluentProvider,
  Input,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Spinner,
  Subtitle2,
  Title1,
  makeStyles,
  tokens,
  webDarkTheme,
  webLightTheme,
} from '@fluentui/react-components'
import {
  ArrowClockwiseRegular,
  DatabaseSearchRegular,
  PeopleRegular,
  PersonAddRegular,
  WarningRegular,
} from '@fluentui/react-icons'

import './main.css'

const UsersList = lazy(() => import('./components/UsersList'))
const CreateUserDialog = lazy(() => import('./components/CreateUserDialog'))
const UpdateUserDialog = lazy(() => import('./components/UpdateUserDialog'))
const DeleteUserDialog = lazy(() => import('./components/DeleteUserDialog'))
const AssignAppsDialog = lazy(() => import('./components/AssignAppsDialog'))
const SetPasswordDialog = lazy(() => import('./components/SetPasswordDialog'))
const ManageSambaDialog = lazy(() => import('./components/ManageSambaDialog'))

const useStyles = makeStyles({
  page: {
    minHeight: '100vh',
    paddingTop: '28px',
    paddingRight: '28px',
    paddingBottom: '28px',
    paddingLeft: '28px',
    backgroundColor: tokens.colorNeutralBackground2,
    backgroundImage: 'linear-gradient(135deg, rgba(0, 120, 212, .09), rgba(16, 124, 16, .06) 48%, rgba(196, 49, 75, .07))',
    color: tokens.colorNeutralForeground1,

    '@media (max-width: 720px)': {
      paddingTop: '18px',
      paddingRight: '16px',
      paddingBottom: '18px',
      paddingLeft: '16px',
    },
  },
  shell: {
    maxWidth: '1180px',
    marginRight: 'auto',
    marginLeft: 'auto',
    display: 'grid',
    gap: '20px',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  titleBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  titleIcon: {
    width: '48px',
    height: '48px',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '8px',
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    fontSize: '26px',
  },
  toolbar: {
    display: 'grid',
    gridTemplateColumns: 'minmax(240px, 420px) auto',
    justifyContent: 'space-between',
    gap: '12px',

    '@media (max-width: 640px)': {
      gridTemplateColumns: '1fr',
    },
  },
  search: {
    width: '100%',
  },
  center: {
    minHeight: '280px',
    display: 'grid',
    placeItems: 'center',
  },
  emptyState: {
    minHeight: '260px',
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
  emptyHeader: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '6px',
  },
})

const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')

const App = () => {
  const styles = useStyles()
  const [theme, setTheme] = useState(darkModeQuery.matches ? webDarkTheme : webLightTheme)
  const [users, setUsers] = useState<LocalCloud.User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [search, setSearch] = useState<string>('')
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false)
  const [userToUpdate, setUserToUpdate] = useState<LocalCloud.User | null>(null)
  const [userToDelete, setUserToDelete] = useState<LocalCloud.User | null>(null)
  const [userToAssignApps, setUserToAssignApps] = useState<LocalCloud.User | null>(null)
  const [userToSetPassword, setUserToSetPassword] = useState<LocalCloud.User | null>(null)
  const [userToManageSamba, setUserToManageSamba] = useState<LocalCloud.User | null>(null)
  const [sambaUsers, setSambaUsers] = useState<Record<number, boolean | undefined>>({})

  const loadUsers = useCallback(() => {
    setLoading(true)
    setError('')

    window.sdk.users.getAll()
      .then(async results => {
        if (results === null) {
          setError('No se pudo obtener la lista de usuarios.')
          setUsers([])
          setSambaUsers({})
          return
        }

        setUsers(results)
        const sambaEntries = await Promise.all(results.map(async user => {
          try {
            const enabled = await window.sdk.samba.belongsTo(user.uid)
            return [user.uid, enabled === true] as const
          } catch (reason) {
            console.error(reason)
            return [user.uid, false] as const
          }
        }))
        setSambaUsers(Object.fromEntries(sambaEntries))
      })
      .catch(reason => {
        console.error(reason)
        setError('Ocurrio un error al cargar los usuarios.')
        setUsers([])
        setSambaUsers({})
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const handleThemeChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? webDarkTheme : webLightTheme)
    }

    darkModeQuery.addEventListener('change', handleThemeChange)
    return () => darkModeQuery.removeEventListener('change', handleThemeChange)
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const filteredUsers = useMemo(() => {
    const value = search.trim().toLowerCase()
    if (value === '') {
      return users
    }

    return users.filter(user => (
      user.name.toLowerCase().includes(value)
      || user.fullName.toLowerCase().includes(value)
      || user.email.toLowerCase().includes(value)
      || user.phone.toLowerCase().includes(value)
      || user.uid.toString().includes(value)
    ))
  }, [search, users])

  return (
    <StrictMode>
      <FluentProvider theme={theme}>
        <main className={styles.page}>
          <div className={styles.shell}>
            <section className={styles.header}>
              <div className={styles.titleBlock}>
                <div className={styles.titleIcon}>
                  <PeopleRegular />
                </div>
                <div>
                  <Title1>Usuarios</Title1>
                  <br />
                  <Body1>Consulta los usuarios registrados en LocalCloud.</Body1>
                </div>
              </div>
              <div className={styles.headerActions}>
                <Button
                  appearance="primary"
                  icon={<PersonAddRegular />}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  Nuevo usuario
                </Button>
                <Button
                  appearance="secondary"
                  icon={<ArrowClockwiseRegular />}
                  onClick={loadUsers}
                  disabled={loading}
                >
                  Actualizar
                </Button>
              </div>
            </section>

            <section className={styles.toolbar}>
              <Input
                className={styles.search}
                contentBefore={<DatabaseSearchRegular />}
                placeholder="Buscar por nombre, correo, telefono o UID"
                value={search}
                onChange={(_, data) => setSearch(data.value)}
              />
              <Caption1>{filteredUsers.length} de {users.length} usuarios</Caption1>
            </section>

            {error && (
              <MessageBar intent="error" layout="multiline">
                <MessageBarBody>
                  <MessageBarTitle>Error</MessageBarTitle>
                  {error}
                </MessageBarBody>
              </MessageBar>
            )}

            {loading ? (
              <div className={styles.center}>
                <Spinner size="huge" label="Cargando usuarios" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className={styles.emptyState}>
                <div>
                  <div className={styles.emptyHeader}>
                    <WarningRegular fontSize={28} />
                    <Subtitle2>No hay usuarios para mostrar.</Subtitle2>
                  </div>
                  <Body1>Prueba ajustando la busqueda o actualizando la lista.</Body1>
                </div>
              </div>
            ) : (
              <Suspense fallback={(
                <div className={styles.center}>
                  <Spinner label="Preparando usuarios" />
                </div>
              )}>
                <UsersList
                  users={filteredUsers}
                  sambaUsers={sambaUsers}
                  onAssignApps={setUserToAssignApps}
                  onSetPassword={setUserToSetPassword}
                  onManageSamba={setUserToManageSamba}
                  onEdit={setUserToUpdate}
                  onDelete={setUserToDelete}
                />
              </Suspense>
            )}

            {createDialogOpen && (
              <Suspense fallback={null}>
                <CreateUserDialog
                  onClose={() => setCreateDialogOpen(false)}
                  onCreated={loadUsers}
                />
              </Suspense>
            )}

            {userToUpdate !== null && (
              <Suspense fallback={null}>
                <UpdateUserDialog
                  user={userToUpdate}
                  onClose={() => setUserToUpdate(null)}
                  onUpdated={loadUsers}
                />
              </Suspense>
            )}

            {userToDelete !== null && (
              <Suspense fallback={null}>
                <DeleteUserDialog
                  user={userToDelete}
                  onClose={() => setUserToDelete(null)}
                  onDeleted={loadUsers}
                />
              </Suspense>
            )}

            {userToAssignApps !== null && (
              <Suspense fallback={null}>
                <AssignAppsDialog
                  user={userToAssignApps}
                  onClose={() => setUserToAssignApps(null)}
                />
              </Suspense>
            )}

            {userToSetPassword !== null && (
              <Suspense fallback={null}>
                <SetPasswordDialog
                  user={userToSetPassword}
                  onClose={() => setUserToSetPassword(null)}
                />
              </Suspense>
            )}

            {userToManageSamba !== null && (
              <Suspense fallback={null}>
                <ManageSambaDialog
                  user={userToManageSamba}
                  initialEnabled={sambaUsers[userToManageSamba.uid]}
                  onClose={() => setUserToManageSamba(null)}
                  onUpdated={enabled => {
                    setSambaUsers(current => ({
                      ...current,
                      [userToManageSamba.uid]: enabled,
                    }))
                  }}
                />
              </Suspense>
            )}
          </div>
        </main>
      </FluentProvider>
    </StrictMode>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
