import { BaseAPI } from './API/BaseAPI'
import { notSession, session } from './middlewares/session'

export * from './File'
export * from './App'
export * from './API'

export class IndexController extends BaseAPI {
  @Model('BuilderModel') public builder: Models<'BuilderModel'>

  @Before([notSession])
  @View('/login', { title: 'LocalCloud - Iniciar sesión', description: 'LocalCloud - Iniciar sesión' })
  public login = 'os/index'

  @Before([session])
  @View('/', { title: 'LocalCloud - Dashboard', description: 'LocalCloud - Dashboard' })
  public index = 'os/index'

  @Get('/api/connector.js')
  public async connector(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    if (process.env.ROOT_MODE === 'true') {
      const result = this.builder.builder.build()
      res
        .setHeader('content-type', 'text/javascript')
        .send(result)
      return
    }
    const origin = this.getOrigin(req?.headers?.referer)
    let token = req.session.token
    let key = req.session.key
    let apis: string[] = this.builder.builder.publicApiList
    if (req.session.user) {
      if (origin === 1) {
        apis = this.builder.builder.dashApiList
      } else if (typeof origin === 'string' && req.session?.apps?.[origin]) {
        token = req.session.apps[origin].token
        apis = req.session.apps[origin].permissions
      }
    }
    const result = this.builder.builder.build({ key, token, apis })
    res
      .setHeader('content-type', 'text/javascript')
      .send(result)
  }
}