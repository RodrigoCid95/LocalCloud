import path from 'node:path'
import { BaseAPI } from './BaseAPI'
import { setPermission, PERMISSIONS } from './middlewares/permissions'

@Namespace('api', 'recycle_bin')
export class RecycleBinController extends BaseAPI {
  @Model('FileSystem') private fsModel: Models<'FileSystem'>
  @Model('RecycleBinModel') private recycleBinModel: Models<'RecycleBinModel'>

  private resolvePath(p: string[], user?: string) {
    p = p.filter((s: string) => s !== '..' && s !== '')
    const base = p.shift()
    if (base === 'user' && user) {
      return path.join(this.fsModel.homeDir, user, ...p)
    }
    if (base === 'shared') {
      return path.join(this.fsModel.sharedDir, ...p)
    }
    return ''
  }

  public resolvePaths(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: Next): void {
    if (!req.body.path) {
      res.status(400).json({ ok: false, code: 'missing-path', message: 'The path is required.' })
      return
    }
    if (!Array.isArray(req.body.path)) {
      res.status(400).json({ ok: false, message: 'The path has to be an array.' })
      return
    }
    const [base] = req.body.path
    if (!['user', 'shared'].includes(base)) {
      res.status(400).json({ ok: false, code: 'drive-invalid', message: 'The drive not found.' })
      return
    }
    req.body.resolvedPath = this.resolvePath(req.body.path, req.session.user?.name || '')
    next()
  }

  public emit(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    res.json({ ok: true })
    if (this.checkPermission(req, PERMISSIONS.RB_CHANGE)) {
      if (this.checkPermission(req, PERMISSIONS.FS_CHANGE)) {
        let event = req.body.path.join('/')
        event = `/${event}`
        io._nsps.get('/fs')?.to(req.session.id).emit(event)
      }
      io._nsps.get('/recycle-bin')?.to(req.session.id).emit('change')
    }
  }

  @Before<RecycleBinController>([setPermission(PERMISSIONS.RB_GET), 'verifyPermission'])
  @Get('/')
  public get(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    const items = this.recycleBinModel.get(req.session.user?.name || '')
    res.json(items)
  }

  @Before<RecycleBinController>([setPermission(PERMISSIONS.RB_PUT), 'verifyPermission', 'resolvePaths'])
  @After(['emit'])
  @Put('/')
  public async put(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const id = this.recycleBinModel.put(req.session.user?.name || '', req.body.path)
    const newPath = path.join(this.recycleBinModel.rbPath, id)
    await this.fsModel.copy(req.body.resolvedPath, newPath, true)
    res.json({ ok: true })
  }

  @Before<RecycleBinController>([setPermission(PERMISSIONS.RB_RESTORE), 'verifyPermission'])
  @After(['emit'])
  @Post('/:id')
  public async restore(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const item = this.recycleBinModel.get(req.session.user?.name || '', req.params.id) as RecycleBin.Item
    const itemPath = path.join(this.recycleBinModel.rbPath, item.id)
    const newPath = this.resolvePath(item.path, req.session.user?.name)
    await this.fsModel.copy(itemPath, newPath, true)
    this.recycleBinModel.delete(req.session.user?.name || '', req.params.id)
    res.json({ ok: true })
    req.body.path = item.path
  }

  @Before<RecycleBinController>([setPermission(PERMISSIONS.RB_DELETE), 'verifyPermission'])
  @Delete('/:id')
  public async delete(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const item = this.recycleBinModel.get(req.session.user?.name || '', req.params.id) as RecycleBin.Item
    const itemPath = path.join(this.recycleBinModel.rbPath, item.id)
    this.fsModel.rm(itemPath)
    this.recycleBinModel.delete(req.session.user?.name || '', req.params.id)
    res.json({ ok: true })
    if (this.checkPermission(req, PERMISSIONS.RB_CHANGE)) {
      io._nsps.get('/recycle-bin')?.to(req.session.id).emit('change')
    }
  }

  @Before<RecycleBinController>([setPermission(PERMISSIONS.RB_CLEAN), 'verifyPermission'])
  @Delete('/')
  public async clean(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const items = this.recycleBinModel.get(req.session.user?.name || '')
    this.recycleBinModel.clean(req.session.user?.name || '')
    for (const item of items) {
      const itemPath = path.join(this.recycleBinModel.rbPath, item.id)
      this.fsModel.rm(itemPath)
    }
    res.json({ ok: true })
    if (this.checkPermission(req, PERMISSIONS.RB_CHANGE)) {
      io._nsps.get('/recycle-bin')?.to(req.session.id).emit('change')
    }
  }
}