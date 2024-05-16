import { verifySession } from './middlewares/session'
import { verifyPermission } from './middlewares/permissions'
import { decryptRequest } from './middlewares/encrypt'
import { PROFILE } from 'libraries/classes/APIList'

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const BeforeMiddleware: PXIOHTTP.BeforeMiddlewareDecorator
declare const METHODS: PXIOHTTP.METHODS

const { GET, POST, PUT } = METHODS

@Namespace('api/profile', { before: [verifySession] })
export class ProfileAPIController {
  @Model('DevModeModel') public devModeModel: Models<'DevModeModel'>
  @Model('AppsModel') private appsModel: Models<'AppsModel'>
  @Model('UsersModel') private usersModel: Models<'UsersModel'>
  @On(GET, '/')
  @BeforeMiddleware([verifyPermission(PROFILE.INDEX)])
  public index(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    res.json(req.session.user)
  }
  @On(GET, '/apps')
  @BeforeMiddleware([verifyPermission(PROFILE.APPS)])
  public async apps(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const results = await this.appsModel.getAppsByUID(req.session.user?.uid || NaN)
    const apps: Partial<Apps.App>[] = results.map(app => ({
      package_name: app.package_name,
      title: app.title,
      description: app.description,
      author: app.author
    }))
    res.json(apps)
  }
  @On(POST, '/')
  @BeforeMiddleware([verifyPermission(PROFILE.UPDATE), decryptRequest])
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
  @On(PUT, '/')
  @BeforeMiddleware([verifyPermission(PROFILE.UPDATE_PASSWORD), decryptRequest])
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