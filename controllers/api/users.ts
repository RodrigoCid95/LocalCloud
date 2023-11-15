import type { LocalCloud } from 'declarations'
import type { User } from 'interfaces/Users'
import type { Next, Request, Response } from 'phoenix-js/http'
import type { UsersModel } from 'models'
import { Model } from 'phoenix-js/core'
import { Prefix, On, Methods, beforeMiddelware } from 'phoenix-js/http'
import { verifyPageSession, verifyAPIPermission, decryptRequest } from '../middlewares/session'

const { GET, POST, PUT } = Methods

@Prefix('api/users')
export class UsersController {
  @Model('UsersModel') private model: UsersModel
  @On(GET, '/')
  @beforeMiddelware([verifyPageSession, verifyAPIPermission])
  public async getUsers(req: Request<LocalCloud.SessionData>, res: Response): Promise<void> {
    let users: User[] = []
    if (Object.keys(req.query).length > 0) {
      if (req.query?.current !== undefined) {
        users = [req.session.user as User]
      } else {
        users = await this.model.find(Object.keys(req.query).length > 0 ? req.query : undefined)
      }
    } else {
      users = await this.model.find()
    }
    res.json(users)
  }
  @On(POST, '/')
  @beforeMiddelware([verifyPageSession, verifyAPIPermission, decryptRequest])
  public async create(req: Request<LocalCloud.SessionData>, res: Response, next: Next): Promise<void> {
    const { userName, fullName, email, phone, password } = req.body
    this.model.create({ userName, photo: '', fullName, email, phone, password })
      .then(() => res.status(204))
      .catch(error => next({
        code: 'user-exist',
        message: error.message
      }))
  }
  @On(PUT, '/:uuid')
  @beforeMiddelware([verifyPageSession, verifyAPIPermission, decryptRequest])
  public async update(req: Request<LocalCloud.SessionData>, res: Response): Promise<void> {
    const { fullName = '', email = '', phone = '' } = req.body
    await this.model.update(req.params.uuid, { fullName, email, phone })
    res.status(204)
  }
}