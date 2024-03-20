import { verifySession, verifyNotSession } from './middlewares/session'
import { tokens } from './middlewares/tokens'

declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const BeforeMiddleware: PXIOHTTP.BeforeMiddlewareDecorator
declare const METHODS: PXIOHTTP.METHODS
const { GET } = METHODS

export class IndexController {
  @Model('AppsModel') private appsModel: Models<'AppsModel'>
  @On(GET, '/')
  @BeforeMiddleware([tokens, verifySession])
  public dashboard(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    res.render('dashboard', { title: 'LocalCloud - Dashboard', description: 'LocalCloud - Dashboard', key: req.session.key, token: req.session.systemToken })
  }
  @On(GET, '/login')
  @BeforeMiddleware([tokens, verifyNotSession])
  public login(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    res.render('login', { title: 'LocalCloud - Iniciar sesión', description: 'LocalCloud - Iniciar sesión', key: req.session.key, token: req.session.systemToken })
  }
  @On(GET, '/test')
  public async test(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    /* const package_name = 'com.users.sys'
    await this.appsModel.register({
      package_name,
      title: 'Usuarios',
      description: "Gestión de usuarios",
      author: 'Rodrigo Cid',
      icon: '',
      dependencies: [],
      secureSources: {
        font: 'self',
        img: 'self',
        connect: 'self',
        script: 'self'
      }
    }) */
    /* await this.appsModel.assignAppToUser(req.session.user?.uuid || '', package_name) */
    res.status(200).json(req.session.apps)
  }
}

export * from './apis'