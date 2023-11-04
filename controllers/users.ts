import type { LocalCloud } from 'declarations'
import type { Request, Response } from 'phoenix-js/http'
import type { UsersModel } from 'models'
import { Model } from 'phoenix-js/core'
import { Prefix, On, Methods, beforeMiddelware } from 'phoenix-js/http'
import { verifyPageSession, verifyAPISession } from './middlewares/session'

const { GET } = Methods

@Prefix('users')
export class UsersController {
  @Model('UsersModel') private model: UsersModel
  @On(GET, '/')
  @beforeMiddelware([verifyPageSession, verifyAPISession])
  public async getUsers(req: Request<LocalCloud.SessionData>, res: Response): Promise<void> {
    const users = await this.model.find(Object.keys(req.query).length > 0 ? req.query : undefined)
    res.json(users)
  }
}