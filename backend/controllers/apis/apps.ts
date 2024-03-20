import { verifySession } from './../middlewares/session'

declare const Namespace: PXIO.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const BeforeMiddleware: PXIOHTTP.BeforeMiddlewareDecorator
declare const METHODS: PXIOHTTP.METHODS
const { GET, POST } = METHODS

@Namespace('api/apps')
export class AppsAPIController {
  @Model('AppsModel') private appsModel: Models<'AppsModel'>
  @On(GET, '/')
  @BeforeMiddleware([verifySession])
  public async apps(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const apps = await this.appsModel.getAppsByUUID(req.session.user?.uuid || '')
    res.status(200).json(apps.map(app => ({
      package_name: app.package_name,
      title: app.title,
      description: app.description,
      author: app.author,
      icon: app.icon
    })))
  }
  @On(POST, '/register')
  public async register(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {

  }
}