import { verifySession } from './middlewares/session'
import { verifyPermissions } from './middlewares/permissions'
import { decryptRequest } from './middlewares/encrypt'

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const BeforeMiddleware: PXIOHTTP.BeforeMiddlewareDecorator
declare const METHODS: PXIOHTTP.METHODS
const { GET, POST, DELETE } = METHODS

@Namespace('api/apps', { before: [verifySession, decryptRequest] })
export class AppsAPIController {
  @Model('AppsModel') private appsModel: Models<'AppsModel'>
  @On(GET, '/')
  @BeforeMiddleware([verifyPermissions('APP_LIST')])
  public async apps(_: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const results = await this.appsModel.getApps()
    res.json(results)
  }
  @On(POST, '/')
  @BeforeMiddleware([verifyPermissions('INSTALL_APP')])
  public async install(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    res.json(true)
  }
  @On(DELETE, '/')
  @BeforeMiddleware([verifyPermissions('UNINSTALL_APP')])
  public async unInstall(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    res.json(true)
  }
}