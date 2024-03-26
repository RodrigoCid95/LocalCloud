import { v4, v5 } from 'uuid'
import { verifySession } from './middlewares/session'
import { verifyPermissions } from './middlewares/permissions'
import { decryptRequest } from './middlewares/encrypt'

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const BeforeMiddleware: PXIOHTTP.BeforeMiddlewareDecorator
declare const METHODS: PXIOHTTP.METHODS

const { GET, POST, PUT, DELETE } = METHODS

@Namespace('api/users', { before: [verifySession] })
export class UsersController {
  @Model('UsersModel') private usersModel: Models<'UsersModel'>
  @Model('ProfileModel') private profileModel: Models<'ProfileModel'>
  @Model('AppsModel') private appsModel: Models<'AppsModel'>
  @On(GET, '/')
  @BeforeMiddleware([verifyPermissions('USER_LIST', true)])
  public async index(_: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const results = await this.usersModel.find()
    res.json(results.map(user => ({
      uuid: user.uuid,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      photo: user.photo,
      user_name: user.user_name
    })))
  }
  @On(GET, '/:uuid')
  @BeforeMiddleware([verifyPermissions('USER_INFO', true)])
  public async user(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const [user] = await this.usersModel.find({ uuid: req.params.uuid })
    if (user) {
      res.json({
        uuid: user.uuid,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        photo: user.photo,
        user_name: user.user_name
      })
    } else {
      res.json(null)
    }
  }
  @On(POST, '/')
  @BeforeMiddleware([verifyPermissions('CREATE_USER', true), decryptRequest])
  public async create(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { email, full_name, phone, user_name, password } = req.body
    if (!email || !full_name || !user_name || !password) {
      res.status(400).json({
        code: 'fields-required',
        message: 'Faltan campos!'
      })
      return
    }
    const [result] = await this.usersModel.find({ user_name })
    if (result) {
      res.status(400).json({
        code: 'user-already-exists',
        message: `El usuario ${user_name} ya existe!`
      })
      return
    }
    const uuid = v4()
    const pass = v5(password, uuid)
    await this.usersModel.create({
      user_name,
      full_name,
      email,
      phone,
      password: pass
    }, uuid)
    res.json(true)
  }
  @On(PUT, '/:uuid')
  @BeforeMiddleware([verifyPermissions('UPDATE_USER_INFO', true)])
  public async update(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { full_name, email, phone } = req.body
    await this.profileModel.update(
      { full_name, email, phone },
      req.params.uuid
    )
    res.json(true)
  }
  @On(DELETE, '/:uuid')
  @BeforeMiddleware([verifyPermissions('DELETE_USER', true)])
  public async delete(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    await this.profileModel.delete(req.params.uuid)
    res.json(true)
  }
  @On(POST, '/:uuid/assign-app')
  @BeforeMiddleware([verifyPermissions('ASSIGN_APP_TO_USER')])
  public assignApp(_: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    res.json(true)
  }
  @On(POST, '/:uuid/unassign-app')
  @BeforeMiddleware([verifyPermissions('UNASSIGN_APP_TO_USER')])
  public unassignApp(_: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    res.json(true)
  }
}