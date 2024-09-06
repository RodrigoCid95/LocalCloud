import { verifySession } from './middlewares/session'
import { verifyPermission } from './middlewares/permissions'
import { decryptRequest } from './middlewares/encrypt'
import { PROFILE } from 'libraries/classes/APIList'

@Namespace('api/profile')
@Middlewares({ before: [verifySession] })
export class ProfileAPIController {
  @Model('DevModeModel') public devModeModel: Models<'DevModeModel'>
  @Model('AppsModel') private appsModel: Models<'AppsModel'>
  @Model('UsersModel') private usersModel: Models<'UsersModel'>
  @Before([verifyPermission(PROFILE.INDEX)])
  @Get('/')
  public index(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    res.json(req.session.user)
  }
  @Before([verifyPermission(PROFILE.APPS)])
  @Get('/apps')
  public async apps(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const results = await this.appsModel.getAppsByUID(req.session.user?.uid || NaN)
    const apps: Partial<Apps.App>[] = results.map(app => ({
      package_name: app.package_name,
      title: app.title,
      description: app.description,
      author: app.author
    }))
    res.json(apps.map(({ package_name, title, description, author, extensions, useStorage }) => ({ package_name, title, description, author, extensions, useStorage })))
  }
  @Before([verifyPermission(PROFILE.READ_CONFIG)])
  @Get('/config')
  public getConfig(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    const { name } = req.session.user as Users.User
    const config = this.usersModel.getUserConfig(name)
    res.json(config)
  }
  @Before([verifyPermission(PROFILE.UPDATE), decryptRequest])
  @Post('/')
  public async update(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    if (req.session.user) {
      const { user_name, full_name, email, phone } = req.body
      if (user_name) {
        const result = this.usersModel.getUser(user_name)
        if (result) {
          res.json({
            code: 'user-already-exists',
            message: `El usuario ${user_name} ya existe!`
          })
          return
        }
      }
      await this.usersModel.updateUser(
        req.session.user.name,
        { full_name, email, phone }
      )
      if (full_name) {
        req.session.user.full_name = full_name
      }
      if (email) {
        req.session.user.email = email
      }
      if (phone) {
        req.session.user.phone = phone
      }
    }
    res.json(true)
  }
  @Before([verifyPermission(PROFILE.WRITE_CONFIG), decryptRequest])
  @Post('/config')
  public async setConfig(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { name } = req.session.user as Users.User
    const { config } = req.body
    if (config) {
      this.usersModel.setUserConfig(name, config)
      res.json(true)
    } else {
      res.status(400).json({
        code: 'fields-required',
        message: 'Faltan campos!'
      })
    }
  }
  @Before([verifyPermission(PROFILE.UPDATE_PASSWORD), decryptRequest])
  @Put('/')
  public async updatePassword(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { current_password, new_password } = req.body
    if (!current_password || !new_password) {
      res.status(400).json({
        code: 'fields-required',
        message: 'Faltan campos!'
      })
      return
    }
    if (this.usersModel.verifyPassword(req.session.user?.name || '', current_password)) {
      await this.usersModel.updatePassword(req.session.user?.name || '', new_password)
      res.json({ ok: true })
    } else {
      res.status(400).json({ ok: false, message: 'La contraseña es incorrecta!' })
    }
  }
}