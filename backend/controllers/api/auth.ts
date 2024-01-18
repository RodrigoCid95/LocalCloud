import type { Request, Response } from 'phoenix-js/http'
import type { LocalCloud } from 'declarations'
import type { UsersModel } from 'models/users'
import { Model } from 'phoenix-js/core'
import { Prefix, On, Methods, beforeMiddelware } from 'phoenix-js/http'
import { decryptRequest } from '../middlewares/session'

const { GET, POST, DELETE } = Methods

@Prefix('api/auth')
export class AuthController {
  @Model('UsersModel') private model: UsersModel
  @On(GET, '/')
  public index(req: Request<LocalCloud.SessionData>, res: Response): void {
    if (req.session.user) {
      res.json(req.session.user)
    } else {
      res.json(null)
    }
  }
  @On(POST, '/')
  @beforeMiddelware([decryptRequest])
  public async login(req: Request<LocalCloud.SessionData>, res: Response): Promise<void> {
    const { userName, password } = req.body
    const [user] = await this.model.find({ userName })
    if (user) {
      this.model.verifyPassword(user.uuid, password)
        .then(result => {
          if (result) {
            req.session.user = user
            req.session.apps = {}
            res.status(200).json({ ok: true })
          } else {
            res.status(400).json({ ok: false, message: 'La contraseña es incorrecta!' })
          }
        })
        .catch(({ message }) => res.status(400).json({ message }))
    } else {
      res.status(400).json({ ok: false, message: `El usuario "${userName}" no existe!` })
    }
  }
  @On(DELETE, '/')
  public logout(req: Request<LocalCloud.SessionData>, res: Response): void {
    req.session.destroy(() => res.status(200).json({ ok: true }))
  }
}