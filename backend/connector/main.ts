import { ServerConector } from './Server'

//#region Declaration
declare const $AUTH_LOGIN: any
declare const AUTH_LOGIN: any
declare const $AUTH_LOGOUT: any
declare const AUTH_LOGOUT: any
declare const $AUTH_STATUS: any
declare const AUTH_STATUS: any
declare const $APP_LIST: any
declare const APP_LIST: any
declare const $APP_LIST_BY_UID: any
declare const APP_LIST_BY_UID: any
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
declare const $STORAGE: any
declare const STORAGE: any
//#endregion

const server = new ServerConector()
const connectors: Partial<Connectors> = {}
const defineAPI = (name: keyof Connectors, api: string | boolean, callback: any) => {
  if (typeof api === 'string') {
    if (!Object.prototype.hasOwnProperty.call(connectors, name)) {
      Object.defineProperty(connectors, name, { value: {}, writable: false })
    }
    Object.defineProperty(connectors[name], api, { value: callback(server), writable: false })
  } else {
    if (!Object.prototype.hasOwnProperty.call(connectors, name)) {
      Object.defineProperty(connectors, name, { value: callback(server), writable: false })
    }
  }
}

//#region Auth
$AUTH_LOGIN && defineAPI('auth', 'logIn', AUTH_LOGIN)
$AUTH_LOGOUT && defineAPI('auth', 'logOut', AUTH_LOGOUT)
$AUTH_STATUS && defineAPI('auth', 'status', AUTH_STATUS)
//#endregion
//#region Apps
$APP_LIST && defineAPI('apps', 'list', APP_LIST)
$APP_LIST_BY_UID && defineAPI('apps', 'listByUID', APP_LIST_BY_UID)
$INSTALL_APP && defineAPI('apps', 'install', INSTALL_APP)
$UNINSTALL_APP && defineAPI('apps', 'uninstall', UNINSTALL_APP)
//#endregion
//#region FS
$ACCESS_SHARED_FILE_LIST && defineAPI('fs', 'sharedLs', ACCESS_SHARED_FILE_LIST)
$ACCESS_USER_FILE_LIST && defineAPI('fs', 'userLs', ACCESS_USER_FILE_LIST)
$CREATE_SHARED_DIR && defineAPI('fs', 'sharedMkdir', CREATE_SHARED_DIR)
$CREATE_USER_DIR && defineAPI('fs', 'userMkdir', CREATE_USER_DIR)
$UPLOAD_SHARED_FILE && defineAPI('fs', 'sharedUpload', UPLOAD_SHARED_FILE)
$UPLOAD_USER_FILE && defineAPI('fs', 'userUpload', UPLOAD_USER_FILE)
$REMOVE_SHARED_FILES_AND_DIRECTORIES && defineAPI('fs', 'sharedRm', REMOVE_SHARED_FILES_AND_DIRECTORIES)
$REMOVE_USER_FILES_AND_DIRECTORIES && defineAPI('fs', 'userRm', REMOVE_USER_FILES_AND_DIRECTORIES)
$COPY_FILES_AND_DIRECTORIES && defineAPI('fs', 'copy', COPY_FILES_AND_DIRECTORIES)
$MOVE_FILES_AND_DIRECTORIES && defineAPI('fs', 'move', MOVE_FILES_AND_DIRECTORIES)
$RENAME_FILES_AND_DIRECTORIES && defineAPI('fs', 'rename', RENAME_FILES_AND_DIRECTORIES)
//#endregion
//#region Permissions
$PERMISSION_LIST && defineAPI('permissions', 'find', PERMISSION_LIST)
$ENABLE_PERMISSION && defineAPI('permissions', 'enable', ENABLE_PERMISSION)
$DISABLE_PERMISSION && defineAPI('permissions', 'disable', DISABLE_PERMISSION)
//#endregion
//#region Profile
$PROFILE_INFO && defineAPI('profile', 'info', PROFILE_INFO)
$PROFILE_APP_LIST && defineAPI('profile', 'listApps', PROFILE_APP_LIST)
$UPDATE_PROFILE_INFO && defineAPI('profile', 'update', UPDATE_PROFILE_INFO)
$UPDATE_PASSWORD && defineAPI('profile', 'updatePassword', UPDATE_PASSWORD)
//#endregion
//#region Recycle Bin
$LIST_RECYCLE_BIN && defineAPI('recycleBin', 'list', LIST_RECYCLE_BIN)
$ADD_ITEMS_TO_RECYCLE_BIN && defineAPI('recycleBin', 'add', ADD_ITEMS_TO_RECYCLE_BIN)
$RESTORE_ITEMS_TO_RECYCLE_BIN && defineAPI('recycleBin', 'restore', RESTORE_ITEMS_TO_RECYCLE_BIN)
$DELETE_ITEMS_TO_RECYCLE_BIN && defineAPI('recycleBin', 'delete', DELETE_ITEMS_TO_RECYCLE_BIN)
$CLEAN_RECYCLE_BIN && defineAPI('recycleBin', 'clean', CLEAN_RECYCLE_BIN)
//#endregion
//#region Shared
$SHARED_LIST && defineAPI('shared', 'list', SHARED_LIST)
$SHARED_CREATE && defineAPI('shared', 'create', SHARED_CREATE)
$SHARED_DELETE && defineAPI('shared', 'delete', SHARED_DELETE)
//#endregion
//#region Sources
$SOURCE_LIST && defineAPI('sources', 'find', SOURCE_LIST)
$ENABLE_SOURCE && defineAPI('sources', 'enable', ENABLE_SOURCE)
$DISABLE_SOURCE && defineAPI('sources', 'disable', DISABLE_SOURCE)
//#endregion
//#region Users
$USER_LIST && defineAPI('users', 'list', USER_LIST)
$USER_INFO && defineAPI('users', 'info', USER_INFO)
$CREATE_USER && defineAPI('users', 'create', CREATE_USER)
$UPDATE_USER_INFO && defineAPI('users', 'update', UPDATE_USER_INFO)
$DELETE_USER && defineAPI('users', 'delete', DELETE_USER)
$ASSIGN_APP_TO_USER && defineAPI('users', 'assignApp', ASSIGN_APP_TO_USER)
$UNASSIGN_APP_TO_USER && defineAPI('users', 'unassignApp', UNASSIGN_APP_TO_USER)
//#endregion
//#region Store
$STORAGE && defineAPI('storage', false, STORAGE)
//#endregion

Object.defineProperty(window, 'launchFile', { value: server.launchFile.bind(server), writable: false })
Object.defineProperty(window, 'launchApp', { value: server.launchApp.bind(server), writable: false })
Object.defineProperty(window, 'createURL', { value: server.createURL.bind(server), writable: false })
Object.defineProperty(window, 'createDownloader', { value: server.createDownloader.bind(server), writable: false })
Object.defineProperty(window, 'connectors', { value: connectors, writable: false })

document.dispatchEvent(new CustomEvent('onConnectorReady'))