import { BaseAPI } from "./BaseAPI"
import { PERMISSIONS, setPermission } from "./middlewares/permissions"
import { session } from "./middlewares/session"

@Namespace('api', 'profile')
@Middlewares({ before: [session] })
export class ProfileController extends BaseAPI {
  @Model('UsersModel') private usersModel: Models<'UsersModel'>
  @Model('AppsModel') private appsModel: Models<'AppsModel'>

  @Before<ProfileController>([setPermission(PERMISSIONS.PROFILE_APP_LIST), 'verifyPermission'])
  @Get('/apps')
  public getApps(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    if (process.env.ROOT_MODE === 'true') {
      const apps = this.appsModel.get()
      res.json({ ok: true, apps })
      return
    }
    const apps = this.appsModel.getByUid(req.session.user?.uid || NaN)
    res.json({ ok: true, apps })
  }

  @Before<ProfileController>([setPermission(PERMISSIONS.PROFILE_READ_CONFIG), 'verifyPermission'])
  @Get('/config')
  public async getConfig(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { name } = req.session.user as Users.User
    const config = await this.usersModel.getConfig(name)
    res.json(config)
  }

  @Before<ProfileController>([setPermission(PERMISSIONS.PROFILE_WRITE_CONFIG), 'verifyPermission'])
  @Put('/config')
  public async setConfig(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { name } = req.session.user as Users.User
    if (req.body && typeof req.body === 'object') {
      await this.usersModel.setConfig(name, req.body)
    }
    res.json({ ok: true })
  }

  @Before<ProfileController>([setPermission(PERMISSIONS.PROFILE_INFO), 'verifyPermission'])
  @Get('/')
  public index(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    res.json(req.session.user)
  }

  @Before<ProfileController>([setPermission(PERMISSIONS.PROFILE_UPDATE), 'verifyPermission'])
  @Put('/')
  public async update(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    if (req.session.user) {
      const { full_name, email, phone } = req.body
      const user = await this.usersModel.getByName(req.session.user.name)
      if (user) {
        const newData: Omit<Omit<Users.User, 'name'>, 'uid'> = {
          fullName: full_name || user.fullName,
          email: email || user.email,
          phone: phone || user.phone
        }
        await this.usersModel.update(req.session.user.name, newData)
        req.session.user = {
          ...req.session.user,
          ...newData
        }
        req.session.save(error => {
          if (error) {
            console.error(error)
          }
          res.json({ ok: true })
        })
        return
      }
    }
    res.json({ ok: true })
  }

  @Before<ProfileController>([setPermission(PERMISSIONS.PROFILE_UPDATE_PASSWORD), 'verifyPermission'])
  @Put('/password')
  public async updatePassword(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { current_password, new_password } = req.body
    if (req.session.user) {
      if (!current_password) {
        res.status(400).json({ ok: false, code: 'missing-current-password', message: 'Falta la contraseña actual.' })
        return
      }
      if (!new_password) {
        res.status(400).json({ ok: false, code: 'missing-new-password', message: 'Falta la nueva contraseña.' })
        return
      }
      const { user } = req.session
      const passwordVerification = await this.usersModel.verfyPassword(user.name, current_password)
      if (passwordVerification) {
        await this.usersModel.updatePassword(user.name, new_password)
      } else {
        res.status(400).json({ ok: false, code: 'incorrect-password', message: 'La contraseña es incorrecta.' })
        return
      }
    }
    res.json({ ok: true })
  }
}