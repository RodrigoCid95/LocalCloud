import type { Request, Response } from "phoenix-js/http"
import type { LocalCloud } from "declarations"
import type { UsersModel } from "models/users"
import { Model } from "phoenix-js/core"
import { Prefix, On, Methods, beforeMiddelware } from "phoenix-js/http"
import { decryptRequest, verifySession } from "controllers/middlewares/session"
import { homeOrigin } from "controllers/middlewares/access"

const { POST } = Methods

@Prefix('api/user/profile')
export class ProfileController {
  @Model('UsersModel') private model: UsersModel
  @On(POST, '/')
  @beforeMiddelware([verifySession, decryptRequest, homeOrigin])
  public async update(req: Request<LocalCloud.SessionData>, res: Response): Promise<void> {
    const { fullName, email, phone } = req.body
    await this.model.update(req.session.user?.uuid || '', { fullName, email, phone })
    res.json(true)
  }
}