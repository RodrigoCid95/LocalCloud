import { useCallback, useEffect, useState } from "react"
import { Spinner, Title1, Title3, makeStyles } from "@fluentui/react-components"
import UsersToolbar from './components/Toolbar'
import New from "./components/New"
import Item from "./components/Item"
import Edit from "./components/Edit"
import Apps from "./components/Apps"
import Delete from "./components/Delete"

const useStyles = makeStyles({
  main: {
    padding: '16px'
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '4px'
  }
})

const App = () => {
  const styles = useStyles()
  const [users, setUsers] = useState<Users.User[]>([])
  const [userEdit, setUserEdit] = useState<Users.User | undefined>(undefined)
  const [userApps, setUserApps] = useState<Users.User | undefined>(undefined)
  const [userDelete, setUserDelete] = useState<Users.User | undefined>(undefined)
  const [loading, setLoading] = useState<boolean>(false)
  const [openNew, setOpenNew] = useState<boolean>(false)

  const handleLoadUsers = useCallback(() => {
    window.connectors.users.list().then((list) => {
      setUsers(list)
      setLoading(false)
    })
  }, [setUsers, setLoading])

  useEffect(() => {
    handleLoadUsers()
  }, [handleLoadUsers])

  if (loading) {
    return <Spinner className='center-middle' size='huge' />
  }

  return (
    <div className={styles.main}>
      <Title1>Usuarios</Title1>
      <UsersToolbar onReload={handleLoadUsers} onNew={() => setOpenNew(true)} />
      <div className={styles.container}>
        {users.length === 0 && <Title3>No hay usuarios registrados.</Title3>}
        {users.map((user, index) => (
          <Item
            key={index}
            user={user}
            onEdit={() => setUserEdit(user)}
            onApps={() => setUserApps(user)}
            onDelete={() => setUserDelete(user)}
          />
        ))}
      </div>
      <New
        open={openNew}
        onClose={() => setOpenNew(false)}
        onSave={() => {
          handleLoadUsers()
          setOpenNew(false)
        }}
      />
      <Edit
        user={userEdit}
        onClose={() => setUserEdit(undefined)}
        onSave={() => {
          setUserEdit(undefined)
          handleLoadUsers()
        }}
      />
      <Apps
        user={userApps}
        onClose={() => setUserApps(undefined)}
      />
      <Delete
        user={userDelete}
        onClose={() => setUserDelete(undefined)}
        onDelete={() => {
          setUserDelete(undefined)
          handleLoadUsers()
        }} />
    </div>
  )
}

export default App