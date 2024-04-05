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

@Namespace('api/profile', { before: [verifySession] })
export class ProfileController {
  @Model('DevModeModel') public devModeModel: Models<'DevModeModel'>
  @Model('AppsModel') private appsModel: Models<'AppsModel'>
  @Model('UsersModel') private usersModel: Models<'UsersModel'>
  @Model('ProfileModel') private profileModel: Models<'ProfileModel'>
  @On(GET, '/')
  @BeforeMiddleware([verifyPermissions('PROFILE_INFO', true)])
  public index(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    res.json(req.session.user)
  }
  @On(GET, '/apps')
  @BeforeMiddleware([verifyPermissions('PROFILE_APP_LIST', true)])
  public async apps(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const results = await this.appsModel.getAppsByUUID(req.session.user?.uuid || '')
    const apps: Partial<Apps.App>[] = results.map(app => ({
      package_name: app.package_name,
      title: app.title,
      description: app.description,
      author: app.author
    }))
    res.json(apps)
  }
  @On(POST, '/')
  @BeforeMiddleware([verifyPermissions('UPDATE_PROFILE_INFO', true), decryptRequest])
  public async update(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    if (req.session.user) {
      const { user_name, full_name, email, phone } = req.body
      if (user_name) {
        const [result] = await this.usersModel.find({ user_name })
        if (result) {
          res.json({
            code: 'user-already-exists',
            message: `El usuario ${user_name} ya existe!`
          })
          return
        }
      }
      await this.profileModel.update(
        { user_name, full_name, email, phone },
        req.session.user.uuid
      )
      if (user_name) {
        req.session.user.user_name = user_name
      }
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
  @BeforeMiddleware([verifyPermissions('UPDATE_PASSWORD', true), decryptRequest])
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