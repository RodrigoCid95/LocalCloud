import { v4, v5 } from 'uuid'
import { decryptRequest } from './middlewares/encrypt'

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const BeforeMiddleware: PXIOHTTP.BeforeMiddlewareDecorator
declare const METHODS: PXIOHTTP.METHODS
const { GET, POST, DELETE } = METHODS

@Namespace('api/auth')
export class AuthAPIController {
  @Model('UsersModel') private userModel: Models<'UsersModel'>
  @Model('AppsModel') private appsModel: Models<'AppsModel'>
  @On(GET, '/')
  public index(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    if (req.session.user) {
      res.json(true)
    } else {
      res.json(null)
    }
  }
  @On(POST, '/')
  @BeforeMiddleware([decryptRequest])
  public async login(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { userName, password } = req.body
    const [user] = await this.userModel.find({ user_name: userName })
    if (user) {
      const new_hash = v5(password, user.uuid)
      if (new_hash === user.password_hash) {
        delete (user as any).password_hash
        req.session.user = user
        req.session.apps = {}
        const apps = await this.appsModel.getAppsByUUID(user.uuid)
        for (const app of apps) {
          const sessionApp: LocalCloud.SessionApp = {
            token: v4(),
            title: app.title,
            description: app.description,
            author: app.author,
            icon: app.icon,
            permissions: app.permissions,
            secureSources: {
              font: app.secureSources.font,
              img: app.secureSources.img,
              connect: app.secureSources.connect,
              script: app.secureSources.script
            }
          }
          req.session.apps[app.package_name] = sessionApp
        }
        res.json({ ok: true })
      } else {
        res.status(400).json({ ok: false, message: 'La contraseña es incorrecta!' })
      }
    } else {
      res.status(400).json({ ok: false, message: `El usuario "${userName}" no existe!` })
    }
  }
  @On(DELETE, '/')
  public logout(req: PXIOHTTP.Request, res: PXIOHTTP.Response): void {
    req.session.destroy((): void => {
      res.json(true)
    })
  }
}