import { verifySession } from './middlewares/session'
import { verifyPermissions } from './middlewares/permissions'

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const METHODS: PXIOHTTP.METHODS
const { GET, POST } = METHODS

@Namespace('api/apps', { before: [verifySession, verifyPermissions(true)] })
export class AppsAPIController {
  @Model('AppsModel') private appsModel: Models<'AppsModel'>
  @On(GET, '/')
  public async apps(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const results = await this.appsModel.getAppsByUUID(req.session.user?.uuid || '')
    const apps: Partial<Apps.App>[] = results.map(app => ({
      package_name: app.package_name,
      title: app.title,
      description: app.description,
      author: app.author,
      icon: app.icon
    }))
    res.status(200).json(apps)
  }
  @On(POST, '/register')
  public async register(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {

  }
}