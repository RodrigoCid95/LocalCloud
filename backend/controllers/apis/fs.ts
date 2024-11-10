import { verifySession } from './middlewares/session'
import { decryptRequest } from './middlewares/encrypt'
import { verifyPermission } from './middlewares/permissions'
import fileUpload from 'express-fileupload'
import { FS } from 'libraries/classes/APIList'

@Namespace('api', 'fs')
@Middlewares({ before: [verifySession, decryptRequest, fileUpload()] })
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
  @Before([verifyPermission(FS.SHARED_DRIVE)])
  @After(['filter'])
  @Post('/shared/list')
  public sharedDrive(req: PXIOHTTP.Request, res: PXIOHTTP.Response, next: Next) {
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
  @Before([verifyPermission(FS.USER_DRIVE)])
  @After(['filter'])
  @Post('/user/list')
  public userDrive(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: Next) {
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
  @Before([verifyPermission(FS.MKDIR_SHARED_DRIVE)])
  @Post('/shared')
  public async mkdirSharedDrive(req: PXIOHTTP.Request, res: PXIOHTTP.Response): Promise<void> {
    const { path = [] } = req.body
    await this.fsModel.mkdirToShared(path)
    res.json(true)
  }
  @Before([verifyPermission(FS.MKDIR_USER_DRIVE)])
  @Post('/user')
  public async mkdirUserDrive(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { path = [] } = req.body
    await this.fsModel.mkdirToUser(req.session.user?.name || '', path)
    res.json(true)
  }
  @Before([verifyPermission(FS.UPLOAD_SHARED_DRIVE)])
  @Put('/shared')
  public async uploadSharedDrive(req: PXIOHTTP.Request, res: PXIOHTTP.Response): Promise<void> {
    let { path = '' } = req.body
    path = path.split('|')
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
  @Before([verifyPermission(FS.UPLOAD_USER_DRIVE)])
  @Put('/user')
  public async uploadUserDrive(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    let { path = '' } = req.body
    path = path.split('|')
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
  @Before([verifyPermission(FS.RM_SHARED_DRIVE)])
  @Delete('/shared')
  public rmSharedDrive(req: PXIOHTTP.Request, res: PXIOHTTP.Response) {
    const { path = [] } = req.body
    this.fsModel.rmToShared(path)
    res.json(true)
  }
  @Before([verifyPermission(FS.RM_USER_DRIVE)])
  @Delete('/user')
  public rmUserDrive(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const { path = [] } = req.body
    this.fsModel.rmToUser(req.session.user?.name || '', path)
    res.json(true)
  }
  @Before([verifyPermission(FS.COPY)])
  @Post('/copy')
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
  @Before([verifyPermission(FS.MOVE)])
  @Post('/move')
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
  @Before([verifyPermission(FS.RENAME)])
  @Post('/rename')
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