import { verifySession } from './middlewares/session'
import { decryptRequest } from './middlewares/encrypt'
import { verifyPermissions } from './middlewares/permissions'
import fileUpload from 'express-fileupload'

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const BeforeMiddleware: PXIOHTTP.BeforeMiddlewareDecorator
declare const METHODS: PXIOHTTP.METHODS

const { POST, PUT, DELETE } = METHODS

@Namespace('/api/fs', { before: [verifySession, decryptRequest, fileUpload()] })
export class FileSystemAPIController {
  @Model('DevModeModel') public devModeModel: Models<'DevModeModel'>
  @Model('FileSystemModel') private fsModel: Models<'FileSystemModel'>
  @On(POST, '/shared/list')
  @BeforeMiddleware([verifyPermissions('ACCESS_SHARED_FILE_LIST')])
  public sharedDrive(req: PXIOHTTP.Request, res: PXIOHTTP.Response) {
    const { path = [] } = req.body
    const result = this.fsModel.lsSharedDirectory(path)
    if (typeof result === 'boolean') {
      res.status(404).json({
        code: 'not-found',
        message: 'La ruta que indicaste no existe.'
      })
      return
    }
    res.json(result)
  }
  @On(POST, '/user/list')
  @BeforeMiddleware([verifyPermissions('ACCESS_USER_FILE_LIST')])
  public userDrive(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const { path = [] } = req.body
    const result = this.fsModel.lsUserDirectory(req.session.user?.uuid || '', path)
    if (typeof result === 'boolean') {
      res.status(404).json({
        code: 'not-found',
        message: 'La ruta que indicaste no existe.'
      })
      return
    }
    res.json(result)
  }
  @On(POST, '/shared')
  @BeforeMiddleware([verifyPermissions('CREATE_SHARED_DIR')])
  public mkdirSharedDrive(req: PXIOHTTP.Request, res: PXIOHTTP.Response) {
    const { path = [] } = req.body
    this.fsModel.mkdirToShared(path)
    res.json(true)
  }
  @On(POST, '/user')
  @BeforeMiddleware([verifyPermissions('CREATE_USER_DIR')])
  public mkdirUserDrive(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const { path = [] } = req.body
    this.fsModel.mkdirToUser(req.session.user?.uuid || '', path)
    res.json(true)
  }
  @On(PUT, '/shared')
  @BeforeMiddleware([verifyPermissions('UPLOAD_SHARED_FILE')])
  public uploadSharedDrive(req: PXIOHTTP.Request, res: PXIOHTTP.Response) {
    const { path = [] } = req.body
    const { files } = req
    if (!files) {
      res.status(400).json({
        code: 'fields-required',
        message: 'Faltan campos!'
      })
      return
    }
    const entries = Object.entries(files)
    for (const [name, value] of entries) {
      this.fsModel.writeToShared([...path, name], (value as fileUpload.UploadedFile).data)
    }
    res.json(true)
  }
  @On(PUT, '/user')
  @BeforeMiddleware([verifyPermissions('UPLOAD_USER_FILE')])
  public uploadUserDrive(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const { path = [] } = req.body
    const { files } = req
    if (!files) {
      res.status(400).json({
        code: 'fields-required',
        message: 'Faltan campos!'
      })
      return
    }
    const entries = Object.entries(files)
    for (const [name, value] of entries) {
      this.fsModel.writeToUser(req.session.user?.uuid || '', [...path, name], (value as fileUpload.UploadedFile).data)
    }
    res.json(true)
  }
  @On(DELETE, '/shared')
  @BeforeMiddleware([verifyPermissions('REMOVE_SHARED_FILES_AND_DIRECTORIES')])
  public rmSharedDrive(req: PXIOHTTP.Request, res: PXIOHTTP.Response) {
    const { path = [] } = req.body
    this.fsModel.rmToShared(path)
    res.json(true)
  }
  @On(DELETE, '/user')
  @BeforeMiddleware([verifyPermissions('REMOVE_USER_FILES_AND_DIRECTORIES')])
  public rmUserDrive(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const { path = [] } = req.body
    this.fsModel.rmToUser(req.session.user?.uuid || '', path)
    res.json(true)
  }
  @On(POST, '/copy')
  @BeforeMiddleware([verifyPermissions('COPY_FILES_AND_DIRECTORIES')])
  public copy(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const { origin, dest } = req.body
    if ((!origin || !dest) && (!Array.isArray(origin) || !Array.isArray(dest))) {
      res.status(400).json({
        code: 'fields-required',
        message: 'Faltan campos!'
      })
      return
    }
    this.fsModel.copy(req.session.user?.uuid || '', origin, dest)
    res.json(true)
  }
  @On(POST, '/move')
  @BeforeMiddleware([verifyPermissions('MOVE_FILES_AND_DIRECTORIES')])
  public move(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const { origin, dest } = req.body
    if ((!origin || !dest) && (!Array.isArray(origin) || !Array.isArray(dest))) {
      res.status(400).json({
        code: 'fields-required',
        message: 'Faltan campos!'
      })
      return
    }
    this.fsModel.copy(req.session.user?.uuid || '', origin, dest, true)
    res.json(true)
  }
  @On(POST, '/rename')
  @BeforeMiddleware([verifyPermissions('RENAME_FILES_AND_DIRECTORIES')])
  public rename(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const { path, newName } = req.body
    if (!Array.isArray(path) || typeof newName !== 'string') {
      res.status(400).json({
        code: 'fields-required',
        message: 'Faltan campos!'
      })
      return
    }
    this.fsModel.rename(req.session.user?.uuid || '', path, newName)
    res.json(true)
  }
}