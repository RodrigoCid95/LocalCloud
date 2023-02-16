import { Model } from 'bitis/core'
import { Prefix, Methods, On, Request, Response, Next } from 'bitis/http'
import { UsersModel } from 'models'
import { User } from 'types/Users'

const { POST } = Methods

const getOptions = (path: string) => ({ path, beforeMiddlewares: ['decrypt'], afterMiddlewares: ['encrypt'] })

@Prefix('auth')
export class AuthController {
  @Model('UsersModel') private usersModel: UsersModel
  @On(POST, getOptions('/signin'))
  public async signin(req: Request, res: Response) {
    if (!(req.session as any).user) {
      const { name, password } = req.body
      if (name && password) {
        const result = await this.usersModel.getWithHash({ name })
        if (result) {
          const { hash } = result
          let userHashing = ''
          for (let i = 0; i < hash.length; i++) {
            userHashing += String.fromCharCode(hash.charCodeAt(i) ^ password.charCodeAt(i % password.length))
          }
          if (userHashing === name) {
            const { uuid, name, fullName, email, role } = result
            const user: User = { uuid, name, fullName, email, role };
            (req.session as any).user = user
            res.json(true)
            return
          }
        }
      }
    }
    res.json(false)
  }
  @On(POST, '/signout')
  public signout(req: Request, res: Response) {
    req.session.destroy(() => res.status(200).end())
  }
  public encrypt(req: Request, res: Response) {
    res.send((req.session as any).data)
  }
  public async decrypt(req: Request, _: Response, next: Next) {
    if (req.body?.dataEncrypt && (req.session as any).socketID) {
      req.body = await this.usersModel.cipher.decrypt((req.session as any).socketID, req.body.dataEncrypt)
    }
    next()
  }
}