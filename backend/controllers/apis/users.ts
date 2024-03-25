import { verifySession } from './middlewares/session'
import { verifyPermissions } from './middlewares/permissions'
import { decryptRequest } from './middlewares/encrypt'

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const BeforeMiddleware: PXIOHTTP.BeforeMiddlewareDecorator
declare const METHODS: PXIOHTTP.METHODS

const { GET, POST, PUT, DELETE } = METHODS

@Namespace('api/users', { before: [verifySession], after: [decryptRequest] })
export class UsersController {
  @Model('UsersModel') private usersModel: Models<'UsersModel'>
  @On(GET, '/')
  @BeforeMiddleware([verifyPermissions(['users', 0], true)])
  public index(_: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    res.json(true)
  }
  @On(POST, '/')
  @BeforeMiddleware([verifyPermissions(['users', 1], true)])
  public create(_: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    res.json(true)
  }
  @On(PUT, '/')
  @BeforeMiddleware([verifyPermissions(['users', 2], true)])
  public update(_: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    res.json(true)
  }
  @On(PUT, '/')
  @BeforeMiddleware([verifyPermissions(['users', 3], true)])
  public delete(_: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    res.json(true)
  }
}