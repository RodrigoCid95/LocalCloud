import permissions from './permissions.sql'
import users from './users.sql'
import groups from './groups.sql'
import apps from './apps.sql'
import appsToPermissions from './apps_to_permissions.sql'
import groupsToPermissions from './groups_to_permissions.sql'
import usersToGroups from './users_to_groups.sql'

export default [
  permissions,
  users,
  groups,
  apps,
  appsToPermissions,
  groupsToPermissions,
  usersToGroups
]