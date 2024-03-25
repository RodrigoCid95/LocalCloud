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
    res.render('dashboard', { title: 'LocalCloud - Dashboard', description: 'LocalCloud - Dashboard', key: req.session.key, token: req.session.token })
  }
  @On(GET, '/get-key')
  @BeforeMiddleware([tokens])
  public tokens(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    res.json({ key: req.session.key })
  }
  @On(GET, '/login')
  @BeforeMiddleware([tokens, verifyNotSession])
  public login(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    res.render('login', { title: 'LocalCloud - Iniciar sesión', description: 'LocalCloud - Iniciar sesión', key: req.session.key, token: req.session.token })
  }
  @On(GET, '/test')
  public async test(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    /* const package_name = 'com.users.sys' */
    /* await this.appsModel.register({
      package_name,
      title: 'Usuarios',
      description: "Gestión de usuarios",
      author: 'Rodrigo Cid',
      icon: '',
      permissions: {
        profile: [0, 1],
        apps: [0, 1, 2]
      },
      secureSources: {
        font: "'self'",
        img: "'self'",
        connect: "'self'",
        script: "'self'"
      }
    }) */
    /* await this.appsModel.assignAppToUser(req.session.user?.uuid || '', package_name) */
    res.json(req.session.apps)
  }
}

export * from './app'
export * from './apis'