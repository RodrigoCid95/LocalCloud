import crypto from 'node:crypto'
import { decryptRequest } from './middlewares/encrypt'
import { verifyPermission } from './middlewares/permissions'
import { AUTH } from 'libraries/classes/APIList'

@Namespace('api', 'auth')
export class AuthAPIController {
  @Model('UsersModel') private usersModel: Models<'UsersModel'>
  @Model('AppsModel') private appsModel: Models<'AppsModel'>
  @Model('DevModeModel') private devModeModel: Models<'DevModeModel'>
  @Model('SourcesModel') private sourcesModel: Models<'SourcesModel'>
  @Model('PermissionsModel') private permissionsModel: Models<'PermissionsModel'>
  @Before([verifyPermission(AUTH.INDEX)])
  @Get('/')
  public async index(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    if (req.session.user || this.devModeModel.devMode.enable) {
      res.json(true)
    } else {
      res.json(false)
    }
  }
  @Before([verifyPermission(AUTH.LOGIN), decryptRequest])
  @Post('/')
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
            token: crypto.randomUUID(),
            useTemplate: (app as any).useTemplate
          }
          req.session.apps[app.package_name] = sessionApp
        }
        res.json({ ok: true })
      } else {
        res.status(400).json({ ok: false, code: 'incorrect-password', message: 'La contraseña es incorrecta!' })
      }
    } else {
      res.status(400).json({ ok: false, code: 'user-not-found', message: `El usuario "${userName}" no existe!` })
    }
  }
  @Before([verifyPermission(AUTH.LOGOUT)])
  @Delete('/')
  public logout(req: PXIOHTTP.Request, res: PXIOHTTP.Response): void {
    req.session.destroy((): void => {
      res.json(true)
    })
  }
}