import { v5 } from 'uuid'
import { verifySession } from './middlewares/session'
import { verifyPermissions } from './middlewares/permissions'
import { decryptRequest } from './middlewares/encrypt'

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const BeforeMiddleware: PXIOHTTP.BeforeMiddlewareDecorator
declare const METHODS: PXIOHTTP.METHODS

const { GET, POST, PUT } = METHODS

@Namespace('api/profile', { before: [verifySession], after: [decryptRequest] })
export class ProfileController {
  @Model('AppsModel') private appsModel: Models<'AppsModel'>
  @Model('UsersModel') private usersModel: Models<'UsersModel'>
  @Model('ProfileModel') private profileModel: Models<'ProfileModel'>
  @On(GET, '/')
  @BeforeMiddleware([verifyPermissions(['profile', 0], true)])
  public index(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    res.json(req.session.user)
  }
  @On(GET, '/apps')
  @BeforeMiddleware([verifyPermissions(['profile', 1], true)])
  public async apps(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const results = await this.appsModel.getAppsByUUID(req.session.user?.uuid || '')
    const apps: Partial<Apps.App>[] = results.map(app => ({
      package_name: app.package_name,
      title: app.title,
      description: app.description,
      author: app.author,
      icon: app.icon
    }))
    res.json(apps)
  }
  @On(POST, '/')
  @BeforeMiddleware([verifyPermissions(['profile', 2], true)])
  public async update(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    if (req.session.user) {
      const { full_name, email, phone } = req.body
      await this.profileModel.update(
        { full_name, email, phone },
        req.session.user.uuid
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
  @BeforeMiddleware([verifyPermissions(['profile', 3], true)])
  public async updatePassword(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { current_password, new_password } = req.body
    const [user] = await this.usersModel.find({ uuid: req.session.user?.uuid })
    const current_hash = v5(current_password, user.uuid)
    if (current_hash === user.password_hash) {
      const new_hash = v5(new_password, user.uuid)
      await this.profileModel.update({ password_hash: new_hash }, user.uuid)
      res.json({ ok: true })
    } else {
      res.status(400).json({ ok: false, message: 'La contraseña es incorrecta!' })
    }
  }
}