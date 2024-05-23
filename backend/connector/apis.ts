import type { ServerConector } from 'connector/Server'

const ACCESS_SHARED_FILE_LIST = (server: ServerConector): FS.SharedLsMethod => (path, filter) => {
  const params = {}
  if (filter) {
    if (filter.ext) {
      params['ext'] = filter.ext.join(',')
    }
    if (filter.showHidden) {
      params['showHidden'] = true
    }
  }
  return server.send({
    endpoint: 'fs/shared/list',
    method: 'post',
    data: { path },
    params
  })
}

export { ACCESS_SHARED_FILE_LIST }

const ACCESS_USER_FILE_LIST = (server: ServerConector): FS.UserLsMethod => (path, filter) => {
  const params = {}
  if (filter) {
    if (filter.ext) {
      params['ext'] = filter.ext.join(',')
    }
    if (filter.showHidden) {
      params['showHidden'] = true
    }
  }
  return server.send({
    endpoint: 'fs/user/list',
    method: 'post',
    data: { path },
    params
  })
}

export { ACCESS_USER_FILE_LIST }

const ADD_ITEMS_TO_RECYCLE_BIN = (server: ServerConector): RecycleBin.AddMethod => path => server.send({
  endpoint: 'recycle-bin',
  method: 'post',
  data: { path }
})

export { ADD_ITEMS_TO_RECYCLE_BIN }

const APP_LIST_BY_UID = (server: ServerConector): Apps.ListByUIDMethod => uid => server.send({
  endpoint: `apps/${uid}`,
  method: 'get'
})

export { APP_LIST_BY_UID }

const APP_LIST = (server: ServerConector): Apps.ListMethod => () => server.send({
  endpoint: 'apps',
  method: 'get'
})

export { APP_LIST }

const ASSIGN_APP_TO_USER = (server: ServerConector): Users.AssignAppMethod => (uid, package_name) => server.send({
  endpoint: 'users/assign-app',
  method: 'post',
  data: { uid, package_name }
})

export { ASSIGN_APP_TO_USER }

const AUTH_LOGIN = (server: ServerConector): Auth.LoginMethod => credentials => server.send({
  method: 'post',
  endpoint: 'auth',
  data: credentials
})

export { AUTH_LOGIN }

const AUTH_LOGOUT = (server: ServerConector): Auth.LogOutMethod => () => server.send({
  endpoint: 'auth',
  method: 'delete'
})

export { AUTH_LOGOUT }

const AUTH_STATUS = (server: ServerConector): Auth.StatusMethod => () => server.send<boolean>({
  endpoint: 'auth',
  method: 'get'
})

export { AUTH_STATUS }

const CLEAN_RECYCLE_BIN = (server: ServerConector): RecycleBin.CleanMethod => () => server.send({
  endpoint: 'recycle-bin',
  method: 'delete'
})

export { CLEAN_RECYCLE_BIN }

const COPY_FILES_AND_DIRECTORIES = (server: ServerConector): FS.CopyMethod => (origin, dest) => server.send({
  endpoint: 'fs/copy',
  method: 'post',
  data: { origin, dest }
})

export { COPY_FILES_AND_DIRECTORIES }

const CREATE_SHARED_DIR = (server: ServerConector): FS.SharedMkdirMethod => path => server.send({
  endpoint: 'fs/shared',
  method: 'post',
  data: { path }
})

export { CREATE_SHARED_DIR }

const CREATE_USER_DIR = (server: ServerConector): FS.UserMkdirMethod => path => server.send({
  endpoint: 'fs/user',
  method: 'post',
  data: { path }
})

export { CREATE_USER_DIR }

const CREATE_USER = (server: ServerConector): Users.CreateMethod => newUser => server.send({
  endpoint: 'users',
  method: 'post',
  data: newUser
})

export { CREATE_USER }

const DELETE_ITEMS_TO_RECYCLE_BIN = (server: ServerConector): RecycleBin.DeleteMethod => id => server.send({
  endpoint: `recycle-bin/${id}`,
  method: 'delete'
})

export { DELETE_ITEMS_TO_RECYCLE_BIN }

const DELETE_USER = (server: ServerConector): Users.DeleteMethod => uid => server.send({
  endpoint: `users/${uid}`,
  method: 'delete'
})

export { DELETE_USER }

const DISABLE_PERMISSION = (server: ServerConector): Permissions.DisableMethod => id => server.send({
  endpoint: `permissions/${id}`,
  method: 'delete'
})

export { DISABLE_PERMISSION }

const DISABLE_SOURCE = (server: ServerConector): SecureSources.DisableMethod => id => server.send({
  endpoint: `sources/${id}`,
  method: 'delete'
})

export { DISABLE_SOURCE }

const ENABLE_PERMISSION = (server: ServerConector): Permissions.EnableMethod => id => server.send({
  endpoint: `permissions/${id}`,
  method: 'post'
})

export { ENABLE_PERMISSION }

const ENABLE_SOURCE = (server: ServerConector): SecureSources.EnableMethod => id => server.send({
  endpoint: `sources/${id}`,
  method: 'post'
})

export { ENABLE_SOURCE }

const INSTALL_APP = (server: ServerConector): Apps.InstallMethod => (file, update) => server.createUploader({
  api: 'apps',
  path: [],
  file: { name: 'package_zip', file },
  metadata: update ? { update: 'true' } : undefined
})

export { INSTALL_APP }

const LIST_RECYCLE_BIN = (server: ServerConector): RecycleBin.ListMethod => () => server.send({
  endpoint: 'recycle-bin',
  method: 'get'
})

export { LIST_RECYCLE_BIN }

const MOVE_FILES_AND_DIRECTORIES = (server: ServerConector): FS.MoveMethod => (origin, dest) => server.send({
  endpoint: 'fs/move',
  method: 'post',
  data: { origin, dest }
})

export { MOVE_FILES_AND_DIRECTORIES }

const PERMISSION_LIST = (server: ServerConector): Permissions.FindMethod => query => server.send({
  endpoint: 'permissions',
  method: 'get',
  params: { ...query }
})

export { PERMISSION_LIST }

const PROFILE_APP_LIST = (server: ServerConector): Profile.ListAppsMethod => () => server.send<Apps.App[]>({
  endpoint: 'profile/apps',
  method: 'get'
})

export { PROFILE_APP_LIST }

const PROFILE_INFO = (server: ServerConector): Profile.InfoMethod => () => server.send<Users.User>({
  endpoint: 'profile',
  method: 'get'
})

export { PROFILE_INFO }

const REMOVE_SHARED_FILES_AND_DIRECTORIES = (server: ServerConector): FS.SharedRmMethod => path => server.send({
  endpoint: 'fs/shared',
  method: 'delete',
  data: { path }
})

export { REMOVE_SHARED_FILES_AND_DIRECTORIES }

const REMOVE_USER_FILES_AND_DIRECTORIES = (server: ServerConector): FS.UserRmMethod => path => server.send({
  endpoint: 'fs/user',
  method: 'delete',
  data: { path }
})

export { REMOVE_USER_FILES_AND_DIRECTORIES }

const RENAME_FILES_AND_DIRECTORIES = (server: ServerConector): FS.RenameMethod => (path, newName) => server.send({
  endpoint: 'fs/rename',
  method: 'post',
  data: { path, newName }
})

export { RENAME_FILES_AND_DIRECTORIES }

const RESTORE_ITEMS_TO_RECYCLE_BIN = (server: ServerConector): RecycleBin.RestoreMethod => id => server.send({
  endpoint: `recycle-bin/${id}`,
  method: 'put'
})

export { RESTORE_ITEMS_TO_RECYCLE_BIN }

const SHARED_CREATE = (server: ServerConector): Shared.CreateMethod => path => server.send({
  endpoint: 'shared',
  method: 'post',
  data: { path }
})

export { SHARED_CREATE }

const SHARED_DELETE = (server: ServerConector): Shared.DeleteMethod => id => server.send({
  endpoint: `shared/${id}`,
  method: 'delete',
})

export { SHARED_DELETE }

const SHARED_LIST = (server: ServerConector): Shared.ListMethod => () => server.send({
  endpoint: 'shared',
  method: 'get'
})

export { SHARED_LIST }

const SOURCE_LIST = (server: ServerConector): SecureSources.FindMethod => params => server.send({
  endpoint: 'sources',
  method: 'get',
  params
})

export { SOURCE_LIST }

const UNASSIGN_APP_TO_USER = (server: ServerConector): Users.UnassignAppMethod => (uid, package_name) => server.send({
  endpoint: 'users/unassign-app',
  method: 'post',
  data: { uid, package_name }
})

export { UNASSIGN_APP_TO_USER }

const UNINSTALL_APP = (server: ServerConector): Apps.UninstallMethod => package_name => server.send({
  endpoint: `apps/${package_name}`,
  method: 'delete'
})

export { UNINSTALL_APP }

const UPDATE_PASSWORD = (server: ServerConector): Profile.UpdatePasswordMethod => data => server.send({
  endpoint: 'profile',
  method: 'put',
  data
})

export { UPDATE_PASSWORD }

const UPDATE_PROFILE_INFO = (server: ServerConector): Profile.UpdateMethod => data => server.send<void>({
  endpoint: 'profile',
  method: 'post',
  data
})

export { UPDATE_PROFILE_INFO }

const UPDATE_USER_INFO = (server: ServerConector): Users.UpdateMethod => (uid, data) => server.send({
  endpoint: `users/${uid}`,
  method: 'put',
  data
})

export { UPDATE_USER_INFO }

const UPLOAD_SHARED_FILE = (server: ServerConector): FS.SharedUploadMethod => ({ path, file }) => server.createUploader({
  api: 'fs',
  path: ['shared', ...path],
  file: { name: file.name, file }
})

export { UPLOAD_SHARED_FILE }

const UPLOAD_USER_FILE = (server: ServerConector): FS.UserUploadMethod => ({ path, file }) => server.createUploader({
  api: 'fs',
  path: ['user', ...path],
  file: { name: file.name, file }
})

export { UPLOAD_USER_FILE }

const USER_INFO = (server: ServerConector): Users.InfoMethod => uid => server.send({
  endpoint: `users/${uid}`,
  method: 'get'
})

export { USER_INFO }

const USER_LIST = (server: ServerConector): Users.ListMethod => () => server.send({
  endpoint: 'users',
  method: 'get'
})

export { USER_LIST }

const STORAGE = (server: ServerConector): Storage.Connector => ({
  global: {
    set: (name, data) => server.send({
      endpoint: `storage/${name}`,
      method: 'put',
      data: { content: data }
    }),
    get: (name) => server.send({
      endpoint: `storage/${name}`,
      method: 'get'
    })
  },
  user: {
    set: (name, data) => server.send({
      endpoint: `storage/user/${name}`,
      method: 'put',
      data: { content: data }
    }),
    get: (name) => server.send({
      endpoint: `storage/user/${name}`,
      method: 'get'
    })
  }
})

export { STORAGE }

const PROFILE_READ_CONFIG = (server: ServerConector): Profile.GetConfigMethod => () => server.send({
  endpoint: 'profile/config',
  method: 'get'
})

export { PROFILE_READ_CONFIG }

const PROFILE_WRITE_CONFIG = (server: ServerConector): Profile.SetConfigMethod => (config) => server.send({
  endpoint: 'profile/config',
  method: 'post',
  data: { config }
})

export { PROFILE_WRITE_CONFIG }