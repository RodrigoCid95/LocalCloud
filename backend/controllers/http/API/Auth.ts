import crypto from 'node:crypto'
import { BaseAPI } from './BaseAPI'
import { PERMISSIONS, setPermission } from './middlewares/permissions'

@Namespace('api', 'auth')
export class AuthController extends BaseAPI {
  @Model('UsersModel') private usersModel: Models<'UsersModel'>
  @Model('AppsModel') private appsModel: Models<'AppsModel'>
  @Model('SourcesModel') private sourcesModel: Models<'SourcesModel'>
  @Model('PermissionsModel') private permissionsModel: Models<'PermissionsModel'>

  @Before<BaseAPI>([setPermission(PERMISSIONS.AUTH_STATUS), 'verifyPermission'])
  @Get('/')
  public index(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    res.json(process.env.USER !== undefined || req.session.user !== undefined)
  }

  @Before<BaseAPI>([setPermission(PERMISSIONS.AUTH_LOGIN), 'verifyPermission'])
  @Post('/')
  public async login(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { user_name: userName, password } = req.body
    if (!userName || !password) {
      res.status(400).json({
        code: 'fields-required',
        message: 'Faltan campos!'
      })
      return
    }
    const user = await this.usersModel.getByName(userName)
    if (!user) {
      res.status(400).json({ ok: false, code: 'user-not-found', message: `El usuario "${userName}" no existe!` })
      return
    }
    const verification = await this.usersModel.verfyPassword(userName, password)
    if (!verification) {
      res.status(400).json({ ok: false, code: 'incorrect-password', message: 'La contraseña es incorrecta!' })
      return
    }
    req.session.user = {
      uid: user.uid,
      name: user.name,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone
    }
    const appResults = this.appsModel.getByUid(user.uid)
    const apps: LocalCloud.SessionApps = {}
    for (const appResult of appResults) {
      const secureSources = this.sourcesModel.get(appResult.package_name)
      const permissions = this.permissionsModel
        .get(appResult.package_name)
        .filter(p => p.enable)
        .map(p => p.name)
      apps[appResult.package_name] = {
        title: appResult.title,
        description: appResult.description,
        author: appResult.author,
        extensions: appResult.extensions,
        token: crypto.randomUUID(),
        secureSources,
        permissions,
      }
    }
    req.session.apps = apps
    req.session.save(error => {
      if (error) {
        console.error(error)
      }
      res.json({ ok: true })
      if (this.checkPermission(req, PERMISSIONS.AUTH_CHANGE)) {
        io._nsps.get('/auth')?.to(req.session.id).emit('change', true)
      }
    })
  }

  @Before<BaseAPI>([setPermission(PERMISSIONS.AUTH_LOGOUT), 'verifyPermission'])
  @Delete('/')
  public logout(req: PXIOHTTP.Request, res: PXIOHTTP.Response): void {
    io._nsps.get('/auth')?.to(req.session.id).emit('change', false)
    req.session.destroy(() => {
      if (this.checkPermission(req, PERMISSIONS.AUTH_CHANGE)) {
        io._nsps.forEach(nsp => nsp.disconnectSockets())
      }
      res.json(true)
    })
  }
}