import { ServerConector } from './Server'

declare const $AUTH_LOGIN: any
declare const AUTH_LOGIN: any
declare const $AUTH_LOGOUT: any
declare const AUTH_LOGOUT: any
declare const $AUTH_STATUS: any
declare const AUTH_STATUS: any
declare const $APP_LIST: any
declare const APP_LIST: any
declare const $APP_LIST_BY_UUID: any
declare const APP_LIST_BY_UUID: any
declare const $INSTALL_APP: any
declare const INSTALL_APP: any
declare const $UNINSTALL_APP: any
declare const UNINSTALL_APP: any
declare const $ACCESS_SHARED_FILE_LIST: any
declare const ACCESS_SHARED_FILE_LIST: any
declare const $ACCESS_USER_FILE_LIST: any
declare const ACCESS_USER_FILE_LIST: any
declare const $CREATE_SHARED_DIR: any
declare const CREATE_SHARED_DIR: any
declare const $CREATE_USER_DIR: any
declare const CREATE_USER_DIR: any
declare const $UPLOAD_SHARED_FILE: any
declare const UPLOAD_SHARED_FILE: any
declare const $UPLOAD_USER_FILE: any
declare const UPLOAD_USER_FILE: any
declare const $REMOVE_SHARED_FILES_AND_DIRECTORIES: any
declare const REMOVE_SHARED_FILES_AND_DIRECTORIES: any
declare const $REMOVE_USER_FILES_AND_DIRECTORIES: any
declare const REMOVE_USER_FILES_AND_DIRECTORIES: any
declare const $COPY_FILES_AND_DIRECTORIES: any
declare const COPY_FILES_AND_DIRECTORIES: any
declare const $MOVE_FILES_AND_DIRECTORIES: any
declare const MOVE_FILES_AND_DIRECTORIES: any
declare const $RENAME_FILES_AND_DIRECTORIES: any
declare const RENAME_FILES_AND_DIRECTORIES: any
declare const $PERMISSION_LIST: any
declare const PERMISSION_LIST: any
declare const $ENABLE_PERMISSION: any
declare const ENABLE_PERMISSION: any
declare const $DISABLE_PERMISSION: any
declare const DISABLE_PERMISSION: any
declare const $PROFILE_INFO: any
declare const PROFILE_INFO: any
declare const $PROFILE_APP_LIST: any
declare const PROFILE_APP_LIST: any
declare const $UPDATE_PROFILE_INFO: any
declare const UPDATE_PROFILE_INFO: any
declare const $UPDATE_PASSWORD: any
declare const UPDATE_PASSWORD: any
declare const $LIST_RECYCLE_BIN: any
declare const LIST_RECYCLE_BIN: any
declare const $ADD_ITEMS_TO_RECYCLE_BIN: any
declare const ADD_ITEMS_TO_RECYCLE_BIN: any
declare const $RESTORE_ITEMS_TO_RECYCLE_BIN: any
declare const RESTORE_ITEMS_TO_RECYCLE_BIN: any
declare const $DELETE_ITEMS_TO_RECYCLE_BIN: any
declare const DELETE_ITEMS_TO_RECYCLE_BIN: any
declare const $CLEAN_RECYCLE_BIN: any
declare const CLEAN_RECYCLE_BIN: any
declare const $SHARED_LIST: any
declare const SHARED_LIST: any
declare const $SHARED_CREATE: any
declare const SHARED_CREATE: any
declare const $SHARED_DELETE: any
declare const SHARED_DELETE: any
declare const $SOURCE_LIST: any
declare const SOURCE_LIST: any
declare const $ENABLE_SOURCE: any
declare const ENABLE_SOURCE: any
declare const $DISABLE_SOURCE: any
declare const DISABLE_SOURCE: any
declare const $USER_LIST: any
declare const USER_LIST: any
declare const $USER_INFO: any
declare const USER_INFO: any
declare const $CREATE_USER: any
declare const CREATE_USER: any
declare const $UPDATE_USER_INFO: any
declare const UPDATE_USER_INFO: any
declare const $DELETE_USER: any
declare const DELETE_USER: any
declare const $ASSIGN_APP_TO_USER: any
declare const ASSIGN_APP_TO_USER: any
declare const $UNASSIGN_APP_TO_USER: any
declare const UNASSIGN_APP_TO_USER: any

const server = new ServerConector()
const connectors: Connectors = {}
const defineAPI = (name: keyof Connectors, api: string, callback: any) => {
  if (!Object.prototype.hasOwnProperty.call(connectors, name)) {
    Object.defineProperty(connectors, name, { value: {}, writable: false })
  }
  Object.defineProperty(connectors[name], api, { value: callback(server), writable: false })
}

//#region Auth
$AUTH_LOGIN && defineAPI('auth', 'login', AUTH_LOGIN)
$AUTH_LOGOUT && defineAPI('auth', 'logOut', AUTH_LOGOUT)
$AUTH_STATUS && defineAPI('auth', 'status', AUTH_STATUS)
//#endregion
//#region Apps
$APP_LIST && defineAPI('apps', 'APP_LIST', APP_LIST)
$APP_LIST_BY_UUID && defineAPI('apps', 'APP_LIST_BY_UUID', APP_LIST_BY_UUID)
$INSTALL_APP && defineAPI('apps', 'INSTALL_APP', INSTALL_APP)
$UNINSTALL_APP && defineAPI('apps', 'UNINSTALL_APP', UNINSTALL_APP)
//#endregion
//#region FS
$ACCESS_SHARED_FILE_LIST && defineAPI('fs', 'ACCESS_SHARED_FILE_LIST', ACCESS_SHARED_FILE_LIST)
$ACCESS_USER_FILE_LIST && defineAPI('fs', 'ACCESS_USER_FILE_LIST', ACCESS_USER_FILE_LIST)
$CREATE_SHARED_DIR && defineAPI('fs', 'CREATE_SHARED_DIR', CREATE_SHARED_DIR)
$CREATE_USER_DIR && defineAPI('fs', 'CREATE_USER_DIR', CREATE_USER_DIR)
$UPLOAD_SHARED_FILE && defineAPI('fs', 'UPLOAD_SHARED_FILE', UPLOAD_SHARED_FILE)
$UPLOAD_USER_FILE && defineAPI('fs', 'UPLOAD_USER_FILE', UPLOAD_USER_FILE)
$REMOVE_SHARED_FILES_AND_DIRECTORIES && defineAPI('fs', 'REMOVE_SHARED_FILES_AND_DIRECTORIES', REMOVE_SHARED_FILES_AND_DIRECTORIES)
$REMOVE_USER_FILES_AND_DIRECTORIES && defineAPI('fs', 'REMOVE_USER_FILES_AND_DIRECTORIES', REMOVE_USER_FILES_AND_DIRECTORIES)
$COPY_FILES_AND_DIRECTORIES && defineAPI('fs', 'COPY_FILES_AND_DIRECTORIES', COPY_FILES_AND_DIRECTORIES)
$MOVE_FILES_AND_DIRECTORIES && defineAPI('fs', 'MOVE_FILES_AND_DIRECTORIES', MOVE_FILES_AND_DIRECTORIES)
$RENAME_FILES_AND_DIRECTORIES && defineAPI('fs', 'RENAME_FILES_AND_DIRECTORIES', RENAME_FILES_AND_DIRECTORIES)
//#endregion
//#region Permissions
$PERMISSION_LIST && defineAPI('permissions', 'PERMISSION_LIST', PERMISSION_LIST)
$ENABLE_PERMISSION && defineAPI('permissions', 'ENABLE_PERMISSION', ENABLE_PERMISSION)
$DISABLE_PERMISSION && defineAPI('permissions', 'DISABLE_PERMISSION', DISABLE_PERMISSION)
//#endregion
//#region Profile
$PROFILE_INFO && defineAPI('profile', 'info', PROFILE_INFO)
$PROFILE_APP_LIST && defineAPI('profile', 'listApps', PROFILE_APP_LIST)
$UPDATE_PROFILE_INFO && defineAPI('profile', 'update', UPDATE_PROFILE_INFO)
$UPDATE_PASSWORD && defineAPI('profile', 'updatePassword', UPDATE_PASSWORD)
//#endregion
//#region Recycle Bin
$LIST_RECYCLE_BIN && defineAPI('recycleBin', 'LIST_RECYCLE_BIN', LIST_RECYCLE_BIN)
$ADD_ITEMS_TO_RECYCLE_BIN && defineAPI('recycleBin', 'ADD_ITEMS_TO_RECYCLE_BIN', ADD_ITEMS_TO_RECYCLE_BIN)
$RESTORE_ITEMS_TO_RECYCLE_BIN && defineAPI('recycleBin', 'RESTORE_ITEMS_TO_RECYCLE_BIN', RESTORE_ITEMS_TO_RECYCLE_BIN)
$DELETE_ITEMS_TO_RECYCLE_BIN && defineAPI('recycleBin', 'DELETE_ITEMS_TO_RECYCLE_BIN', DELETE_ITEMS_TO_RECYCLE_BIN)
$CLEAN_RECYCLE_BIN && defineAPI('recycleBin', 'CLEAN_RECYCLE_BIN', CLEAN_RECYCLE_BIN)
//#endregion
//#region Shared
$SHARED_LIST && defineAPI('shared', 'SHARED_LIST', SHARED_LIST)
$SHARED_CREATE && defineAPI('shared', 'SHARED_CREATE', SHARED_CREATE)
$SHARED_DELETE && defineAPI('shared', 'SHARED_DELETE', SHARED_DELETE)
//#endregion
//#region Sources
$SOURCE_LIST && defineAPI('sources', 'SOURCE_LIST', SOURCE_LIST)
$ENABLE_SOURCE && defineAPI('sources', 'ENABLE_SOURCE', ENABLE_SOURCE)
$DISABLE_SOURCE && defineAPI('sources', 'DISABLE_SOURCE', DISABLE_SOURCE)
//#endregion
//#region Users
$USER_LIST && defineAPI('users', 'USER_LIST', USER_LIST)
$USER_INFO && defineAPI('users', 'USER_INFO', USER_INFO)
$CREATE_USER && defineAPI('users', 'CREATE_USER', CREATE_USER)
$UPDATE_USER_INFO && defineAPI('users', 'UPDATE_USER_INFO', UPDATE_USER_INFO)
$DELETE_USER && defineAPI('users', 'DELETE_USER', DELETE_USER)
$ASSIGN_APP_TO_USER && defineAPI('users', 'ASSIGN_APP_TO_USER', ASSIGN_APP_TO_USER)
$UNASSIGN_APP_TO_USER && defineAPI('users', 'UNASSIGN_APP_TO_USER', UNASSIGN_APP_TO_USER)
//#endregion

Object.defineProperty(window, 'connectors', { value: connectors, writable: false })

if ('alertController' in window) {
  document.dispatchEvent(new CustomEvent('onReady'))
}