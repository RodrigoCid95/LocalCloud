import { verifySession, verifyNotSession } from './middlewares/session'
import { tokens } from './middlewares/tokens'

declare const On: PXIOHTTP.OnDecorator
declare const BeforeMiddleware: PXIOHTTP.BeforeMiddlewareDecorator
declare const METHODS: PXIOHTTP.METHODS
const { GET } = METHODS

export class IndexController {
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
  public test(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    res.json(req.session.apps)
  }
}

export * from './app'
export * from './apis'