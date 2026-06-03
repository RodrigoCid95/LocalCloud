import {
  Avatar,
  Button,
  Caption1,
  Card,
  CardHeader,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Subtitle2,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components'
import {
  AppsListDetailRegular,
  DeleteRegular,
  EditRegular,
  MailRegular,
  MoreHorizontal20Regular,
  PasswordRegular,
  PersonRegular,
  PhoneRegular,
  ServerRegular,
} from '@fluentui/react-icons'

const useStyles = makeStyles({
  usersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '14px',
  },
  userCard: {
    minHeight: '178px',
  },
  userInfo: {
    display: 'grid',
    gap: '10px',
  },
  infoRow: {
    display: 'grid',
    gridTemplateColumns: '20px minmax(0, 1fr)',
    gap: '10px',
    alignItems: 'center',
    color: tokens.colorNeutralForeground2,
  },
  truncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  deleteAction: {
    color: tokens.colorStatusDangerForeground1,
    ':hover': {
      color: tokens.colorStatusDangerForeground1,
    },
    ':active': {
      color: tokens.colorStatusDangerForeground1,
    },
  },
})

type UsersListProps = {
  users: LocalCloud.User[]
  sambaUsers: Record<number, boolean | undefined>
  onAssignApps: (user: LocalCloud.User) => void
  onSetPassword: (user: LocalCloud.User) => void
  onManageSamba: (user: LocalCloud.User) => void
  onEdit: (user: LocalCloud.User) => void
  onDelete: (user: LocalCloud.User) => void
}

const UsersList = ({
  users,
  sambaUsers,
  onAssignApps,
  onSetPassword,
  onManageSamba,
  onEdit,
  onDelete,
}: UsersListProps) => {
  const styles = useStyles()

  return (
    <section className={styles.usersGrid}>
      {users.map(user => (
        <Card key={user.uid} className={styles.userCard}>
          <CardHeader
            image={<Avatar name={user.fullName || user.name} color="colorful" />}
            header={<Subtitle2>{user.fullName || user.name}</Subtitle2>}
            description={<Caption1>@{user.name} · UID {user.uid}</Caption1>}
            action={(
              <Menu>
                <MenuTrigger disableButtonEnhancement>
                  <Button
                    appearance="transparent"
                    icon={<MoreHorizontal20Regular />}
                    aria-label={`Opciones de ${user.fullName || user.name}`}
                  />
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    <MenuItem icon={<AppsListDetailRegular />} onClick={() => onAssignApps(user)}>
                      Apps
                    </MenuItem>
                    <MenuItem icon={<PasswordRegular />} onClick={() => onSetPassword(user)}>
                      Establecer contraseña
                    </MenuItem>
                    <MenuItem icon={<ServerRegular />} onClick={() => onManageSamba(user)}>
                      Samba
                    </MenuItem>
                    <MenuItem icon={<EditRegular />} onClick={() => onEdit(user)}>
                      Editar
                    </MenuItem>
                    <MenuItem
                      className={styles.deleteAction}
                      icon={<DeleteRegular />}
                      onClick={() => onDelete(user)}
                    >
                      Eliminar
                    </MenuItem>
                  </MenuList>
                </MenuPopover>
              </Menu>
            )}
          />
          <div className={styles.userInfo}>
            <div className={styles.infoRow}>
              <PersonRegular />
              <Text className={styles.truncate}>{user.fullName || 'Sin nombre completo'}</Text>
            </div>
            <div className={styles.infoRow}>
              <MailRegular />
              <Text className={styles.truncate}>{user.email || 'Sin correo registrado'}</Text>
            </div>
            <div className={styles.infoRow}>
              <PhoneRegular />
              <Text className={styles.truncate}>{user.phone || 'Sin telefono registrado'}</Text>
            </div>
            <div className={styles.infoRow}>
              <ServerRegular />
              <Text className={styles.truncate}>
                Samba {sambaUsers[user.uid] === undefined
                  ? 'consultando'
                  : sambaUsers[user.uid] ? 'activado' : 'desactivado'}
              </Text>
            </div>
          </div>
        </Card>
      ))}
    </section>
  )
}

export default UsersList
