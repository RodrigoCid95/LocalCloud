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
export class UsersAPIController {
  @Model('DevModeModel') public devModeModel: Models<'DevModeModel'>
  @Model('UsersModel') private usersModel: Models<'UsersModel'>
  @Model('ProfileModel') private profileModel: Models<'ProfileModel'>
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
    if (!full_name || !user_name || !password) {
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
  @BeforeMiddleware([verifyPermissions('UPDATE_USER_INFO', true), decryptRequest])
  public async update(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { user_name, full_name, email, phone } = req.body
    if (user_name) {
      const [result] = await this.usersModel.find({ user_name })
      if (result && result.uuid !== req.params.uuid) {
        res.json({
          code: 'user-already-exists',
          message: `El usuario ${user_name} ya existe!`
        })
        return
      }
    }
    await this.profileModel.update(
      { user_name, full_name, email, phone },
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
  @On(POST, '/assign-app')
  @BeforeMiddleware([verifyPermissions('ASSIGN_APP_TO_USER'), decryptRequest])
  public async assignApp(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { uuid, package_name } = req.body
    if (uuid && package_name) {
      const [result] = await this.usersModel.find({ uuid })
      if (result) {
        await this.usersModel.assignApp(uuid, package_name)
        res.json(true)
      } else {
        res.status(400).json({
          code: 'user-not-exist',
          message: 'El usuario no existe.'
        })
      }
    } else {
      res.status(400).json({
        code: 'fields-required',
        message: 'Faltan campos!'
      })
    }
  }
  @On(POST, '/unassign-app')
  @BeforeMiddleware([verifyPermissions('UNASSIGN_APP_TO_USER'), decryptRequest])
  public async unassignApp(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { uuid, package_name } = req.body
    if (uuid && package_name) {
      const [result] = await this.usersModel.find({ uuid })
      if (result) {
        await this.usersModel.unassignApp(uuid, package_name)
        res.json(true)
      } else {
        res.status(400).json({
          code: 'user-not-exist',
          message: 'El usuario no existe.'
        })
      }
    } else {
      res.status(400).json({
        code: 'fields-required',
        message: 'Faltan campos!'
      })
    }
  }
}