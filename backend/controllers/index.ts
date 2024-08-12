import { devMode } from './middlewares/dev-mode'
import { verifySession, verifyNotSession } from './middlewares/session'
import { tokens } from './middlewares/tokens'
import { CSP } from './middlewares/csp'

declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const BeforeMiddleware: PXIOHTTP.BeforeMiddlewareDecorator
declare const METHODS: PXIOHTTP.METHODS
const { GET } = METHODS

export class IndexController {
  @Model('UsersModel') public usersModel: Models<'UsersModel'>
  @Model('DevModeModel') public devModeModel: Models<'DevModeModel'>
  @Model('AppsModel') public appsModel: Models<'AppsModel'>
  @Model('PermissionsModel') public permissionsModel: Models<'PermissionsModel'>
  @On(GET, '/')
  @BeforeMiddleware([devMode, CSP, tokens, verifySession])
  public dashboard(_: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    if (this.devModeModel.devMode.enable) {
      res.render('os/index', { title: 'LocalCloud - Dev Mode', description: 'LocalCloud - Modo de desarrollo', devMode: true })
    } else {
      res.render('os/index', { title: 'LocalCloud - Dashboard', description: 'LocalCloud - Dashboard' })
    }
  }
  @On(GET, '/login')
  @BeforeMiddleware([devMode, CSP, tokens, verifyNotSession])
  public login(_: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    res.render('os/index', { title: 'LocalCloud - Iniciar sesión', description: 'LocalCloud - Iniciar sesión' })
  }
  @On(GET, '/test')
  public async test(_: PXIOHTTP.Request, res: PXIOHTTP.Response) {
    await this.permissionsModel.setActive('66b470a0ee48dd54998cb716', true)
    res.json(true)
  }
}

export * from './app'
export * from './file'
export * from './shared'
export * from './launch'
export * from './apis'