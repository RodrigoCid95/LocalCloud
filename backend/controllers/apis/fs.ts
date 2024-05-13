import { verifySession } from './middlewares/session'
import { decryptRequest } from './middlewares/encrypt'
import { verifyPermission } from './middlewares/permissions'
import fileUpload from 'express-fileupload'
import { FS } from 'libraries/classes/APIList'

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
  @BeforeMiddleware([verifyPermission(FS.SHARED_DRIVE)])
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
  @BeforeMiddleware([verifyPermission(FS.USER_DRIVE)])
  public userDrive(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const { path = [] } = req.body
    const result = this.fsModel.lsUserDirectory(req.session.user?.name || '', path)
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
  @BeforeMiddleware([verifyPermission(FS.MKDIR_SHARED_DRIVE)])
  public mkdirSharedDrive(req: PXIOHTTP.Request, res: PXIOHTTP.Response) {
    const { path = [] } = req.body
    this.fsModel.mkdirToShared(path)
    res.json(true)
  }
  @On(POST, '/user')
  @BeforeMiddleware([verifyPermission(FS.MKDIR_USER_DRIVE)])
  public mkdirUserDrive(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const { path = [] } = req.body
    this.fsModel.mkdirToUser(req.session.user?.name || '', path)
    res.json(true)
  }
  @On(PUT, '/shared')
  @BeforeMiddleware([verifyPermission(FS.UPLOAD_SHARED_DRIVE)])
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
  @BeforeMiddleware([verifyPermission(FS.UPLOAD_USER_DRIVE)])
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
      this.fsModel.writeToUser(req.session.user?.name || '', [...path, name], (value as fileUpload.UploadedFile).data)
    }
    res.json(true)
  }
  @On(DELETE, '/shared')
  @BeforeMiddleware([verifyPermission(FS.RM_SHARED_DRIVE)])
  public rmSharedDrive(req: PXIOHTTP.Request, res: PXIOHTTP.Response) {
    const { path = [] } = req.body
    this.fsModel.rmToShared(path)
    res.json(true)
  }
  @On(DELETE, '/user')
  @BeforeMiddleware([verifyPermission(FS.RM_USER_DRIVE)])
  public rmUserDrive(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const { path = [] } = req.body
    this.fsModel.rmToUser(req.session.user?.name || '', path)
    res.json(true)
  }
  @On(POST, '/copy')
  @BeforeMiddleware([verifyPermission(FS.COPY)])
  public copy(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const { origin, dest } = req.body
    if ((!origin || !dest) && (!Array.isArray(origin) || !Array.isArray(dest))) {
      res.status(400).json({
        code: 'fields-required',
        message: 'Faltan campos!'
      })
      return
    }
    this.fsModel.copy(req.session.user?.name || '', origin, dest)
    res.json(true)
  }
  @On(POST, '/move')
  @BeforeMiddleware([verifyPermission(FS.MOVE)])
  public move(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const { origin, dest } = req.body
    if ((!origin || !dest) && (!Array.isArray(origin) || !Array.isArray(dest))) {
      res.status(400).json({
        code: 'fields-required',
        message: 'Faltan campos!'
      })
      return
    }
    this.fsModel.copy(req.session.user?.name || '', origin, dest, true)
    res.json(true)
  }
  @On(POST, '/rename')
  @BeforeMiddleware([verifyPermission(FS.RENAME)])
  public rename(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const { path, newName } = req.body
    if (!Array.isArray(path) || typeof newName !== 'string') {
      res.status(400).json({
        code: 'fields-required',
        message: 'Faltan campos!'
      })
      return
    }
    this.fsModel.rename(req.session.user?.name || '', path, newName)
    res.json(true)
  }
}