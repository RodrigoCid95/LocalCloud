import { verifySession } from './middlewares/session'
import { verifyPermissions } from './middlewares/permissions'

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const BeforeMiddleware: PXIOHTTP.BeforeMiddlewareDecorator
declare const METHODS: PXIOHTTP.METHODS
const { GET, POST, DELETE } = METHODS

@Namespace('api/apps', { before: [verifySession] })
export class AppsAPIController {
  @Model('AppsModel') private appsModel: Models<'AppsModel'>
  @On(GET, '/')
  @BeforeMiddleware([verifyPermissions(['apps', 0], true)])
  public async apps(_: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const results = await this.appsModel.getApps()
    res.json(results)
  }
  @On(POST, '/')
  @BeforeMiddleware([verifyPermissions(['apps', 1], true)])
  public install(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    res.json(true)
  }
  @On(DELETE, '/')
  @BeforeMiddleware([verifyPermissions(['apps', 2], true)])
  public unInstall(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    res.json(true)
  }
  @On(POST, '/assign')
  @BeforeMiddleware([verifyPermissions(['apps', 1], true)])
  public assign(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    res.json(true)
  }
}