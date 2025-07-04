import { BaseAPI } from "./BaseAPI"
import { PERMISSIONS, setPermission } from "./middlewares/permissions"
import { session } from "./middlewares/session"

@Namespace('api', 'users')
@Middlewares({ before: [session] })
export class UsersController extends BaseAPI {
  @Model('UsersModel') private usersModel: Models<'UsersModel'>
  @Model('AppsModel') private appsModel: Models<'AppsModel'>

  @Before<BaseAPI>([setPermission(PERMISSIONS.USERS_CREATE), 'verifyPermission'])
  @Post('/')
  public async create(req: PXIOHTTP.Request, res: PXIOHTTP.Response): Promise<void> {
    const { email, full_name, phone, name, password } = req.body
    if (!name || !password) {
      res.status(400).json({
        code: 'fields-required',
        message: 'Faltan campos!'
      })
      return
    }
    const result = await this.usersModel.getByName(name)
    if (result) {
      res.status(400).json({
        code: 'user-already-exists',
        message: `El usuario ${name} ya existe!`
      })
      return
    }
    await this.usersModel.create({
      name,
      fullName: full_name,
      email,
      phone,
      password
    })
    res.json(true)
  }

  @Before<BaseAPI>([setPermission(PERMISSIONS.USERS_LIST), 'verifyPermission'])
  @Get('/:uid')
  public async user(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const user = await this.usersModel.getByUID(Number(req.params.uid))
    if (user) {
      res.json(user)
    } else {
      res.json(null)
    }
  }

  @Before<BaseAPI>([setPermission(PERMISSIONS.USERS_LIST), 'verifyPermission'])
  @Get('/')
  public async find(req: PXIOHTTP.Request, res: PXIOHTTP.Response): Promise<void> {
    const { name, fullName, email, phone } = req.query as Partial<Users.User>
    let userList: Users.User[]
    if (name || fullName || email || phone) {
      userList = await this.usersModel.getByQuery({ name, fullName, email, phone })
    } else {
      userList = await this.usersModel.getAll()
    }
    res.json(userList)
  }

  @Before<BaseAPI>([setPermission(PERMISSIONS.USERS_UPDATE), 'verifyPermission'])
  @Put('/:uid')
  public async update(req: PXIOHTTP.Request, res: PXIOHTTP.Response): Promise<void> {
    const { uid } = req.params
    const result = await this.usersModel.getByUID(Number(uid))
    if (!result) {
      res.status(400).json({
        code: 'user-not-exist',
        message: 'El usuario no existe.'
      })
      return
    }
    const { full_name: fullName, email, phone } = req.body
    await this.usersModel.update(result.name, { fullName, email, phone })
    res.json(true)
  }

  @Before<BaseAPI>([setPermission(PERMISSIONS.USERS_DELETE), 'verifyPermission'])
  @Delete('/:uid')
  public async delete(req: PXIOHTTP.Request, res: PXIOHTTP.Response): Promise<void> {
    const { uid } = req.params
    const result = await this.usersModel.getByUID(Number(uid))
    if (!result) {
      res.json(true)
      return
    }
    await this.usersModel.delete(result.name)
    res.json(true)
  }

  @Before<BaseAPI>([setPermission(PERMISSIONS.USERS_ASSIGN_APP), 'verifyPermission'])
  @Post('/assign-app')
  public async assignApp(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { uid: strUID, package_name } = req.body
    if (!strUID || !package_name) {
      res.status(400).json({
        ok: false,
        code: 'fields-required',
        message: 'Faltan campos!'
      })
      return
    }
    const apps = this.appsModel.get()
    const app = apps.find(a => a.package_name === package_name)
    if (!app) {
      res.status(400).json({
        ok: false,
        code: 'app-not-installed',
        message: `La aplicación ${package_name} no está instalada.`
      })
      return
    }
    const uid = Number(strUID)
    if (req.session.user?.uid === uid) {
      res.json({ ok: true })
      return
    }
    const result = await this.usersModel.getByUID(uid)
    if (!result) {
      res.status(400).json({
        ok: false,
        code: 'user-not-exist',
        message: 'El usuario no existe.'
      })
      return
    }
    this.usersModel.assignApp(result.uid, package_name)
    res.json({ ok: true })
  }

  @Before<BaseAPI>([setPermission(PERMISSIONS.USERS_UNASSIGN_APP), 'verifyPermission'])
  @Post('/unassign-app')
  public async unassignApp(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { uid: strUID, package_name } = req.body
    if (!strUID || !package_name) {
      res.status(400).json({
        ok: false,
        code: 'fields-required',
        message: 'Faltan campos!'
      })
      return
    }
    const apps = this.appsModel.get()
    const app = apps.find(a => a.package_name === package_name)
    if (!app) {
      res.status(400).json({
        ok: false,
        code: 'app-not-installed',
        message: `La aplicación ${package_name} no está instalada.`
      })
      return
    }
    const uid = Number(strUID)
    if (req.session.user?.uid === uid) {
      res.json({ ok: true })
      return
    }
    const result = await this.usersModel.getByUID(uid)
    if (!result) {
      res.status(400).json({
        ok: false,
        code: 'user-not-exist',
        message: 'El usuario no existe.'
      })
      return
    }
    this.usersModel.unassignApp(result.uid, package_name)
    res.json({ ok: true })
  }
}