import { v4 } from 'uuid'
import { decryptRequest } from './middlewares/encrypt'
import { verifyPermission } from './middlewares/permissions'
import { AUTH } from 'libraries/classes/APIList'

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const BeforeMiddleware: PXIOHTTP.BeforeMiddlewareDecorator
declare const METHODS: PXIOHTTP.METHODS
const { GET, POST, DELETE } = METHODS

@Namespace('api/auth')
export class AuthAPIController {
  @Model('UsersModel') private usersModel: Models<'UsersModel'>
  @Model('AppsModel') private appsModel: Models<'AppsModel'>
  @Model('DevModeModel') private devModeModel: Models<'DevModeModel'>
  @Model('SourcesModel') private sourcesModel: Models<'SourcesModel'>
  @Model('PermissionsModel') private permissionsModel: Models<'PermissionsModel'>
  @On(GET, '/')
  @BeforeMiddleware([verifyPermission(AUTH.INDEX)])
  public async index(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    if (req.session.user || this.devModeModel.devMode.config.enable) {
      res.json(true)
    } else {
      res.json(false)
    }
  }
  @On(POST, '/')
  @BeforeMiddleware([verifyPermission(AUTH.LOGIN), decryptRequest])
  public async login(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { userName, password } = req.body
    const user = this.usersModel.getUser(userName)
    if (user) {
      if (this.usersModel.verifyPassword(userName, password)) {
        delete (user as any).password_hash
        req.session.user = user
        req.session.apps = {}
        const apps = await this.appsModel.getAppsByUID(user.uid)
        for (const app of apps) {
          const { package_name } = app
          const secureSources = await this.sourcesModel.find({ package_name })
          const permissions = await this.permissionsModel.find({ package_name })
          const sessionApp: LocalCloud.SessionApp = {
            ...app,
            secureSources,
            permissions,
            token: v4(),
          }
          req.session.apps[app.package_name] = sessionApp
        }
        res.json({ ok: true })
      } else {
        res.status(400).json({ ok: false, message: 'La contraseña es incorrecta!' })
      }
    } else {
      res.status(400).json({ ok: false, message: `El usuario "${userName}" no existe!` })
    }
  }
  @On(DELETE, '/')
  @BeforeMiddleware([verifyPermission(AUTH.LOGOUT)])
  public logout(req: PXIOHTTP.Request, res: PXIOHTTP.Response): void {
    req.session.destroy((): void => {
      res.json(true)
    })
  }
}