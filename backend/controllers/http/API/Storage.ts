import { BaseAPI } from "./BaseAPI"
import { PERMISSIONS, setPermission } from "./middlewares/permissions"

@Namespace('api', 'storage')
export class StorageController extends BaseAPI {
  @Model('StorageModel') private storageModel: Models<'StorageModel'>

  public verifyOrigin(req: PXIOHTTP.Request, res: PXIOHTTP.Response, next: Next): void {
    const origin = this.getOrigin(req.headers.referer || '')
    if (typeof origin === 'number') {
      res.status(403).json({
        ok: false,
        code: 'permission-denied',
        message: 'Permiso denegado.'
      })
      return
    }
    (req as any).origin = origin
    next()
  }

  @Before<StorageController>([setPermission(PERMISSIONS.SOTORAGE_READ_GLOBAL), 'verifyPermission', 'verifyOrigin'])
  @Get('/')
  public getGlobalStorage(req: PXIOHTTP.Request, res: PXIOHTTP.Response): void {
    const { origin } = req as any
    const data = this.storageModel.getGlobalData(origin)
    res.status(200).json({ ok: true, data })
  }

  @Before<StorageController>([setPermission(PERMISSIONS.SOTORAGE_WRITE_GLOBAL), 'verifyPermission', 'verifyOrigin'])
  @Put('/')
  public setGlobalStorage(req: PXIOHTTP.Request, res: PXIOHTTP.Response): void {
    const { origin } = req as any
    this.storageModel.setGlobalData(origin, req.body || {})
    res.status(200).json({ ok: true })
    if (this.checkPermission(req, PERMISSIONS.SOTORAGE_CHANGE)) {
      io._nsps.get('/storage')?.to(req.session.id).emit(`/change/${origin}/global`, req.body)
    }
  }

  @Before<StorageController>([setPermission(PERMISSIONS.SOTORAGE_READ_USER), 'verifyPermission', 'verifyOrigin'])
  @Get('/user')
  public getUserStorage(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    const { origin } = req as any
    const data = this.storageModel.getUserData(origin, req.session.user?.name || '')
    res.status(200).json({ ok: true, data })
  }

  @Before<StorageController>([setPermission(PERMISSIONS.SOTORAGE_WRITE_USER), 'verifyPermission', 'verifyOrigin'])
  @Put('/user')
  public setUserStorage(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    const { origin, body: data = {} } = req as any
    this.storageModel.setUserData(origin, req.session.user?.name || '', data)
    res.status(200).json({ ok: true })
    if (this.checkPermission(req, PERMISSIONS.SOTORAGE_CHANGE)) {
      io._nsps.get('/storage')?.to(req.session.id).emit(`/change/${origin}/user`, data)
    }
  }
}