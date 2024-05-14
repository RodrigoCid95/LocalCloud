export const APPS = {
  APPS: 'APP_LIST',
  APPS_BY_UID: 'APP_LIST_BY_UID',
  INSTALL: 'INSTALL_APP',
  UNINSTALL: 'UNINSTALL_APP'
}
export const AUTH: APIPermissionList = {
  INDEX: {
    name: 'AUTH_STATUS',
    public: true,
    freeForDashboard: true
  },
  LOGIN: {
    name: 'AUTH_LOGIN',
    public: true,
    freeForDashboard: false
  },
  LOGOUT: {
    name: 'AUTH_LOGOUT',
    public: true,
    freeForDashboard: true
  }
}
export const FS = {
  SHARED_DRIVE: 'ACCESS_SHARED_FILE_LIST',
  USER_DRIVE: 'ACCESS_USER_FILE_LIST',
  MKDIR_SHARED_DRIVE: 'CREATE_SHARED_DIR',
  MKDIR_USER_DRIVE: 'CREATE_USER_DIR',
  UPLOAD_SHARED_DRIVE: 'UPLOAD_SHARED_FILE',
  UPLOAD_USER_DRIVE: 'UPLOAD_USER_FILE',
  RM_SHARED_DRIVE: 'REMOVE_SHARED_FILES_AND_DIRECTORIES',
  RM_USER_DRIVE: 'REMOVE_USER_FILES_AND_DIRECTORIES',
  COPY: 'COPY_FILES_AND_DIRECTORIES',
  MOVE: 'MOVE_FILES_AND_DIRECTORIES',
  RENAME: 'RENAME_FILES_AND_DIRECTORIES'
}
export const PERMISSIONS = {
  FIND: 'PERMISSION_LIST',
  ENABLE: 'ENABLE_PERMISSION',
  DISABLE: 'DISABLE_PERMISSION'
}
export const PROFILE: APIPermissionList = {
  INDEX: {
    name: 'PROFILE_INFO',
    public: false,
    freeForDashboard: true
  },
  APPS: {
    name: 'PROFILE_APP_LIST',
    public: false,
    freeForDashboard: true
  },
  UPDATE: {
    name: 'UPDATE_PROFILE_INFO',
    public: false,
    freeForDashboard: true
  },
  UPDATE_PASSWORD: {
    name: 'UPDATE_PASSWORD',
    public: false,
    freeForDashboard: true
  }
}
export const RECYCLE_BIN = {
  LIST: 'LIST_RECYCLE_BIN',
  CREATE: 'ADD_ITEMS_TO_RECYCLE_BIN',
  RESTORE: 'RESTORE_ITEMS_TO_RECYCLE_BIN',
  DELETE: 'DELETE_ITEMS_TO_RECYCLE_BIN',
  CLEAN: 'CLEAN_RECYCLE_BIN'
}
export const SHARED = {
  INDEX: 'SHARED_LIST',
  CREATE: 'SHARED_CREATE',
  DELETE: 'SHARED_DELETE'
}
export const SOURCES = {
  FIND: 'SOURCE_LIST',
  ENABLE: 'ENABLE_SOURCE',
  DISABLE: 'DISABLE_SOURCE'
}
export const USERS = {
  INDEX: 'USER_LIST',
  USER: 'USER_INFO',
  CREATE: 'CREATE_USER',
  UPDATE: 'UPDATE_USER_INFO',
  DELETE: 'DELETE_USER',
  ASSIGN_APP: 'ASSIGN_APP_TO_USER',
  UNASSIGN_APP: 'UNASSIGN_APP_TO_USER'
}