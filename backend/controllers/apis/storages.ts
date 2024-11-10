import { verifySession } from "./middlewares/session"
import { getOrigin } from './middlewares/permissions'

function verifyPermission(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: Next) {
  const devModel: Models<'DevModeModel'> = (this as StoragesAPIController).devModeModel
  if (devModel.devMode.enable) {
    next()
  } else {
    const origin = getOrigin(req.headers.referer || '')
    const apps: LocalCloud.SessionApps = req.session.apps as LocalCloud.SessionApps
    if (apps[origin]?.useStorage) {
      next()
    } else {
      res.status(404).end()
    }
  }
}

const filterPath = (isGlobal: boolean) => function (req: PXIOHTTP.Request<LocalCloud.SessionData>, _: PXIOHTTP.Response, next: Next) {
  const devModel: Models<'DevModeModel'> = (this as StoragesAPIController).devModeModel
  const storageModel: Models<'StorageModel'> = (this as StoragesAPIController).storageModel
  if (devModel.devMode.enable) {
    if (isGlobal) {
      (req as any).storagePath = storageModel.resolveTempGlobalItem(req.params.name)
    } else {
      (req as any).storagePath = storageModel.resolveTempUserItem(req.params.name)
    }
  } else {
    const origin = getOrigin(req.headers.referer || '')
    if (typeof origin === 'string') {
      if (isGlobal) {
        (req as any).storagePath = storageModel.resolveGlobalItem(origin, req.params.name)
      } else {
        (req as any).storagePath = storageModel.resolveUserItem(origin, req.session.user?.name || '', req.params.name)
      }
    }
  }
  next()
}

@Namespace('api', 'storage')
@Middlewares({ before: [verifySession, verifyPermission] })
export class StoragesAPIController {
  @Model('DevModeModel') public devModeModel: Models<'DevModeModel'>
  @Model('StorageModel') public storageModel: Models<'StorageModel'>
  @Before([filterPath(true)])
  @Get('/:name')
  public globalStore(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    if (typeof (req as any).storagePath === 'string') {
      const contentStorage = this.storageModel.loadStorage((req as any).storagePath)
      res.json(contentStorage)
    } else {
      res.json(null)
    }
  }
  @Before([filterPath(false)])
  @Get('/user/:name')
  public userStore(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    if (typeof (req as any).storagePath === 'string') {
      const contentStorage = this.storageModel.loadStorage((req as any).storagePath)
      res.json(contentStorage)
    } else {
      res.json(null)
    }
  }
  @Before([filterPath(true)])
  @Put('/:name')
  public setGlobalStore(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const content = req.body.content || null
    this.storageModel.writeContent((req as any).storagePath, content)
    res.json(true)
  }
  @Before([filterPath(false)])
  @Put('/user/:name')
  public setUserStore(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const content = req.body.content || null
    this.storageModel.writeContent((req as any).storagePath, content)
    res.json(true)
  }
}
