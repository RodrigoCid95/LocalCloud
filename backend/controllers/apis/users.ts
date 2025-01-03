import { verifySession } from './middlewares/session'
import { verifyPermission } from './middlewares/permissions'
import { decryptRequest } from './middlewares/encrypt'
import { USERS } from 'libraries/classes/APIList'

@Namespace('api', 'users')
@Middlewares({ before: [verifySession] })
export class UsersAPIController {
  @Model('UsersModel') public usersModel: Models<'UsersModel'>
  @Model('DevModeModel') public devModeModel: Models<'DevModeModel'>
  @Before([verifyPermission(USERS.INDEX)])
  @Get('/')
  public index(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    const results = this.usersModel.getUsers()
    const userList = results.filter((user) => user.uid !== req.session.user?.uid)
    res.json(userList)
  }
  @Before([verifyPermission(USERS.USER)])
  @Get('/:uid')
  public user(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    const user = this.usersModel.getUserByUID(Number(req.params.uid))
    if (user) {
      res.json(user)
    } else {
      res.json(null)
    }
  }
  @Before([verifyPermission(USERS.CREATE), decryptRequest])
  @Post('/')
  public create(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    const { email, full_name, phone, name, password } = req.body
    if (!name || !password) {
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
    this.usersModel.createUser({
      name,
      full_name,
      email,
      phone,
      password
    })
    res.json(true)
  }
  @Before([verifyPermission(USERS.UPDATE), decryptRequest])
  @Put('/:uid')
  public async update(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { full_name, email, phone } = req.body
    const uid = Number(req.params.uid)
    if (req.session.user?.uid === uid) {
      res.json(true)
      return
    }
    const result = this.usersModel.getUserByUID(uid)
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
  @Before([verifyPermission(USERS.DELETE)])
  @Delete('/:uid')
  public delete(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    const uid = Number(req.params.uid)
    if (req.session.user?.uid === uid) {
      res.json(true)
      return
    }
    const user = this.usersModel.getUserByUID(uid)
    if (user) {
      this.usersModel.deleteUser(user.name)
    }
    res.json(true)
  }
  @Before([verifyPermission(USERS.ASSIGN_APP), decryptRequest])
  @Post('/assign-app')
  public async assignApp(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { uid: strUID, package_name } = req.body
    if (!strUID || !package_name) {
      res.status(400).json({
        code: 'fields-required',
        message: 'Faltan campos!'
      })
      return
    }
    const uid = Number(strUID)
    if (req.session.user?.uid === uid) {
      res.json(true)
      return
    }
    const result = this.usersModel.getUserByUID(uid)
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
  @Before([verifyPermission(USERS.UNASSIGN_APP), decryptRequest])
  @Post('/unassign-app')
  public async unassignApp(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { uid: strUID, package_name } = req.body
    if (!strUID || !package_name) {
      res.status(400).json({
        code: 'fields-required',
        message: 'Faltan campos!'
      })
      return
    }
    const uid = Number(strUID)
    if (req.session.user?.uid === uid) {
      res.json(true)
      return
    }
    const result = this.usersModel.getUserByUID(uid)
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
