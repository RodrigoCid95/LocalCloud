import { verifySession } from './middlewares/session'
import { decryptRequest } from './middlewares/encrypt'
import { verifyPermission } from './middlewares/permissions'
import fileUpload from 'express-fileupload'
import { FS } from 'libraries/classes/APIList'

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const BeforeMiddleware: PXIOHTTP.BeforeMiddlewareDecorator
declare const AfterMiddleware: PXIOHTTP.AfterMiddlewareDecorator
declare const METHODS: PXIOHTTP.METHODS

const { POST, PUT, DELETE } = METHODS

@Namespace('/api/fs', { before: [verifySession, decryptRequest, fileUpload()] })
export class FileSystemAPIController {
  @Model('DevModeModel') public devModeModel: Models<'DevModeModel'>
  @Model('FileSystemModel') private fsModel: Models<'FileSystemModel'>
  public filter(req: PXIOHTTP.Request, res: PXIOHTTP.Response): void {
    let items: FileSystem.ItemInfo[] = (req as any).result
    if (!req.query.showHidden) {
      items = items.filter(item => !/^\./.test(item.name))
    }
    let containsFiles = true
    if (req.query.onlyDirs) {
      containsFiles = false
      items = items.filter(item => !item.isFile)
    }
    if (req.query.onlyFiles) {
      items = items.filter(item => item.isFile)
    }
    if (containsFiles && req.query.ext) {
      const exts = (req.query.ext as string).split(',')
      items = items.filter(item => {
        let pass = false
        if (item.isFile) {
          for (const ext of exts) {
            if (item.name.endsWith(`.${ext}`)) {
              pass = true
              break
            }
          }
        }
        return pass || (req.query.includeDirs && !item.isFile)
      })
    }
    res.json(items)
  }
  @On(POST, '/shared/list')
  @BeforeMiddleware([verifyPermission(FS.SHARED_DRIVE)])
  @AfterMiddleware(['filter'])
  public sharedDrive(req: PXIOHTTP.Request, res: PXIOHTTP.Response, next: PXIOHTTP.Next) {
    const { path = [] } = req.body
    const result = this.fsModel.lsSharedDirectory(path)
    if (typeof result === 'boolean') {
      res.status(404).json({
        code: 'not-found',
        message: 'La ruta que indicaste no existe.'
      })
      return
    }
    (req as any).result = result
    next()
  }
  @On(POST, '/user/list')
  @BeforeMiddleware([verifyPermission(FS.USER_DRIVE)])
  @AfterMiddleware(['filter'])
  public userDrive(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: PXIOHTTP.Next) {
    const { path = [] } = req.body
    const result = this.fsModel.lsUserDirectory(req.session.user?.name || '', path)
    if (typeof result === 'boolean') {
      res.status(404).json({
        code: 'not-found',
        message: 'La ruta que indicaste no existe.'
      })
      return
    }
    (req as any).result = result
    next()
  }
  @On(POST, '/shared')
  @BeforeMiddleware([verifyPermission(FS.MKDIR_SHARED_DRIVE)])
  public async mkdirSharedDrive(req: PXIOHTTP.Request, res: PXIOHTTP.Response): Promise<void> {
    const { path = [] } = req.body
    await this.fsModel.mkdirToShared(path)
    res.json(true)
  }
  @On(POST, '/user')
  @BeforeMiddleware([verifyPermission(FS.MKDIR_USER_DRIVE)])
  public async mkdirUserDrive(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { path = [] } = req.body
    await this.fsModel.mkdirToUser(req.session.user?.name || '', path)
    res.json(true)
  }
  @On(PUT, '/shared')
  @BeforeMiddleware([verifyPermission(FS.UPLOAD_SHARED_DRIVE)])
  public async uploadSharedDrive(req: PXIOHTTP.Request, res: PXIOHTTP.Response): Promise<void> {
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
      await this.fsModel.writeToShared([...path, name], (value as fileUpload.UploadedFile).data)
    }
    res.json(true)
  }
  @On(PUT, '/user')
  @BeforeMiddleware([verifyPermission(FS.UPLOAD_USER_DRIVE)])
  public async uploadUserDrive(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
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
      await this.fsModel.writeToUser(req.session.user?.name || '', [...path, name], (value as fileUpload.UploadedFile).data)
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
  public async copy(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { origin, dest } = req.body
    if ((!origin || !dest) && (!Array.isArray(origin) || !Array.isArray(dest))) {
      res.status(400).json({
        code: 'fields-required',
        message: 'Faltan campos!'
      })
      return
    }
    await this.fsModel.copy(req.session.user?.name || '', origin, dest)
    res.json(true)
  }
  @On(POST, '/move')
  @BeforeMiddleware([verifyPermission(FS.MOVE)])
  public async move(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { origin, dest } = req.body
    if ((!origin || !dest) && (!Array.isArray(origin) || !Array.isArray(dest))) {
      res.status(400).json({
        code: 'fields-required',
        message: 'Faltan campos!'
      })
      return
    }
    await this.fsModel.copy(req.session.user?.name || '', origin, dest, true)
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