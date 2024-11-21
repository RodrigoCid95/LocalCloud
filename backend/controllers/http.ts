import { devMode } from './middlewares/dev-mode'
import { verifySession, verifyNotSession } from './middlewares/session'
import { tokens } from './middlewares/tokens'
import { CSP } from './middlewares/csp'
import { verifySetup } from './middlewares/setup'

const verifyNotSetup = (_: PXIOHTTP.Request, res: PXIOHTTP.Response, next: Next): void => {
  if (SETUP) {
    next()
  } else {
    res.redirect('/')
  }
}

export class IndexController {
  @Model('UsersModel') public usersModel: Models<'UsersModel'>
  @Model('DevModeModel') public devModeModel: Models<'DevModeModel'>

  @Before([verifyNotSetup])
  @Get('/setup')
  public setup(_: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    res.render('os/setup')
  }

  @Before([verifySetup, devMode, CSP, tokens, verifySession])
  @Get('/')
  public dashboard(_: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    if (this.devModeModel.devMode.enable) {
      res.render('os/index', { title: 'LocalCloud - Dev Mode', description: 'LocalCloud - Modo de desarrollo', devMode: true })
    } else {
      res.render('os/index', { title: 'LocalCloud - Dashboard', description: 'LocalCloud - Dashboard' })
    }
  }
  @Before([verifySetup, devMode, CSP, tokens, verifyNotSession])
  @Get('/login')
  public login(_: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    res.render('os/index', { title: 'LocalCloud - Iniciar sesión', description: 'LocalCloud - Iniciar sesión' })
  }
}

export * from './app'
export * from './file'
export * from './shared'
export * from './launch'
export * from './apis'