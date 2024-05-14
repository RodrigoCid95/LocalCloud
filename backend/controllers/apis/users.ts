import { v4, v5 } from 'uuid'
import { verifySession } from './middlewares/session'
import { verifyPermission } from './middlewares/permissions'
import { decryptRequest } from './middlewares/encrypt'
import { USERS } from 'libraries/classes/APIList'

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const BeforeMiddleware: PXIOHTTP.BeforeMiddlewareDecorator
declare const METHODS: PXIOHTTP.METHODS

const { GET, POST, PUT, DELETE } = METHODS

@Namespace('api/users', { before: [verifySession] })
export class UsersAPIController {
  @Model('UsersModel') public usersModel: Models<'UsersModel'>
  @Model('DevModeModel') public devModeModel: Models<'DevModeModel'>
  @On(GET, '/')
  @BeforeMiddleware([verifyPermission(USERS.INDEX)])
  public index(_: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    const results = this.usersModel.getUsers()
    res.json(results)
  }
  @On(GET, '/:uid')
  @BeforeMiddleware([verifyPermission(USERS.USER)])
  public user(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    const user = this.usersModel.getUserByUID(Number(req.params.uid))
    if (user) {
      res.json(user)
    } else {
      res.json(null)
    }
  }
  @On(POST, '/')
  @BeforeMiddleware([verifyPermission(USERS.CREATE), decryptRequest])
  public async create(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { email, full_name, phone, name, password } = req.body
    if (!full_name || !name || !password) {
      res.status(400).json({
        code: 'fields-required',
        message: 'Faltan campos!'
      })
      return
    }
    const result = this.usersModel.getUser(name)
    if (result) {
      res.status(400).json({
        code: 'user-already-exists',
        message: `El usuario ${name} ya existe!`
      })
      return
    }
    await this.usersModel.createUser({
      name,
      full_name,
      email,
      phone,
      password
    })
    res.json(true)
  }
  @On(PUT, '/:uid')
  @BeforeMiddleware([verifyPermission(USERS.UPDATE), decryptRequest])
  public update(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    const { full_name, email, phone } = req.body
    const result = this.usersModel.getUserByUID(Number(req.params.uid))
    if (!result) {
      res.status(400).json({
        code: 'user-not-exist',
        message: 'El usuario no existe.'
      })
      return
    }
    this.usersModel.updateUser(result.name, { full_name, email, phone })
    res.json(true)
  }
  @On(DELETE, '/:uid')
  @BeforeMiddleware([verifyPermission(USERS.DELETE)])
  public async delete(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const user = this.usersModel.getUserByUID(Number(req.params.uid))
    if (user) {
      await this.usersModel.deleteUser(user.name)
    }
    res.json(true)
  }
  @On(POST, '/assign-app')
  @BeforeMiddleware([verifyPermission(USERS.ASSIGN_APP), decryptRequest])
  public async assignApp(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { uid, package_name } = req.body
    if (!uid || !package_name) {
      res.status(400).json({
        code: 'fields-required',
        message: 'Faltan campos!'
      })
      return
    }
    const result = this.usersModel.getUserByUID(Number(uid))
    if (!result) {
      res.status(400).json({
        code: 'user-not-exist',
        message: 'El usuario no existe.'
      })
      return
    }
    await this.usersModel.assignApp(result.uid, package_name)
    res.json(true)
  }
  @On(POST, '/unassign-app')
  @BeforeMiddleware([verifyPermission(USERS.UNASSIGN_APP), decryptRequest])
  public async unassignApp(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { uid, package_name } = req.body
    if (!uid || !package_name) {
      res.status(400).json({
        code: 'fields-required',
        message: 'Faltan campos!'
      })
      return
    }
    const result = this.usersModel.getUserByUID(Number(uid))
    if (!result) {
      res.status(400).json({
        code: 'user-not-exist',
        message: 'El usuario no existe.'
      })
      return
    }
    await this.usersModel.unassignApp(result.uid, package_name)
    res.json(true)
  }
}