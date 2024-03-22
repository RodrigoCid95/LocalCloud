import { v5 } from 'uuid'
import { verifySession } from './middlewares/session'
import { verifyPermissions } from './middlewares/permissions'
import { decryptRequest } from './middlewares/encrypt'

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const METHODS: PXIOHTTP.METHODS

const { GET, POST, PUT } = METHODS

@Namespace('api/profile', { before: [verifySession, verifyPermissions(true), decryptRequest] })
export class ProfileController {
  @Model('UsersModel') private userModel: Models<'UsersModel'>
  @Model('ProfileModel') private profileModel: Models<'ProfileModel'>
  @On(GET, '/')
  public index(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    res.json(req.session.user)
  }
  @On(POST, '/')
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
  public async updatePassword(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { current_password, new_password } = req.body
    const [user] = await this.userModel.find({ uuid: req.session.user?.uuid })
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