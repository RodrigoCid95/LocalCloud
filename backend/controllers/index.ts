import { verifySession, verifyNotSession } from './middlewares/session'
import { tokens } from './middlewares/tokens'

declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const BeforeMiddleware: PXIOHTTP.BeforeMiddlewareDecorator
declare const METHODS: PXIOHTTP.METHODS
const { GET } = METHODS

export class IndexController {
  @Model('AppsModel') private appsModel: Models<'AppsModel'>
  @Model('UsersModel') private usersModel: Models<'UsersModel'>
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
    const package_name = 'com.users.sys'
    await this.appsModel.register({
      package_name,
      title: 'Usuarios',
      description: "Gestión de usuarios",
      author: 'Rodrigo Cid',
      permissions: [
        {
          api: 'USER_LIST',
          justification: '',
          active: true
        },
        {
          api: 'USER_INFO',
          justification: '',
          active: true
        },
        {
          api: 'CREATE_USER',
          justification: '',
          active: true
        },
        {
          api: 'UPDATE_USER_INFO',
          justification: '',
          active: true
        },
        {
          api: 'DELETE_USER',
          justification: '',
          active: true
        },
        {
          api: 'ASSIGN_APP_TO_USER',
          justification: '',
          active: true
        },
        {
          api: 'UNASSIGN_APP_TO_USER',
          justification: '',
          active: true
        },
      ],
      secureSources: []
    })
    await this.usersModel.assignAppToUser(req.session.user?.uuid || '', package_name)
    res.json(req.session.apps)
  }
}

export * from './app'
export * from './apis'