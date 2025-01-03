import { verifySession } from './middlewares/session'
import { decryptRequest } from './middlewares/encrypt'
import { verifyPermission } from './middlewares/permissions'
import { RECYCLE_BIN } from 'libraries/classes/APIList'

@Namespace('api', 'recycle-bin')
@Middlewares({ before: [verifySession, decryptRequest] })
export class RecycleBinController {
  @Model('DevModeModel') public devModeModel: Models<'DevModeModel'>
  @Model('FileSystemModel') private fsModel: Models<'FileSystemModel'>
  @Model('RecycleBinModel') private recycleBinModel: Models<'RecycleBinModel'>
  @Before([verifyPermission(RECYCLE_BIN.LIST)])
  @Get('/')
  public async list(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const results = await this.recycleBinModel.findByUID(req.session.user?.uid || NaN)
    res.json(results)
  }
  @Before([verifyPermission(RECYCLE_BIN.CREATE)])
  @Post('/')
  public async create(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    if (!req.body.path || !Array.isArray(req.body.path) || req.body.path?.length < 2) {
      res.status(403).json({
        code: 'bad-request',
        message: 'La ruta no es válida.'
      })
      return
    }
    const path = req.body.path || []
    const result = this.fsModel.resolvePath(req.session.user?.name || '', path, true)
    if (typeof result === 'boolean') {
      res.status(404).json({
        code: 'not-found',
        message: 'La ruta que indicaste no existe.'
      })
      return
    }
    await this.recycleBinModel.moveToRecycleBin(req.session.user as Users.User, result, path)
    res.json(true)
  }
  @Before([verifyPermission(RECYCLE_BIN.RESTORE)])
  @Put('/:id')
  public async restore(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const { id } = req.params
    const result = await this.recycleBinModel.findByID(id)
    if (!result) {
      res.json(true)
      return
    }
    const path = this.fsModel.resolvePath(req.session.user?.name || '', result.path, false) as string
    await this.recycleBinModel.restore(req.session.user?.name || '', result.id, path)
    res.json(true)
  }
  @Before([verifyPermission(RECYCLE_BIN.DELETE)])
  @Delete('/:id')
  public async delete(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    await this.recycleBinModel.delete(req.session.user as Users.User, req.params.id)
    res.json(true)
  }
  @Before([verifyPermission(RECYCLE_BIN.CLEAN)])
  @Delete('/')
  public async clean(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    await this.recycleBinModel.clean(req.session.user as Users.User)
    res.json(true)
  }
}