import { verifySession } from './middlewares/session'
import { decryptRequest } from './middlewares/encrypt'
import { verifyPermissions } from './middlewares/permissions'

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const BeforeMiddleware: PXIOHTTP.BeforeMiddlewareDecorator
declare const METHODS: PXIOHTTP.METHODS

const { GET, POST, PUT, DELETE } = METHODS

@Namespace('/api/recycle-bin', { before: [verifySession, decryptRequest] })
export class RecycleBinController {
  @Model('DevModeModel') public devModeModel: Models<'DevModeModel'>
  @Model('FileSystemModel') private fsModel: Models<'FileSystemModel'>
  @Model('RecycleBinModel') private recycleBinModel: Models<'RecycleBinModel'>
  @On(GET, '/')
  @BeforeMiddleware([verifyPermissions('LIST_RECYCLE_BIN')])
  public async list(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const results = await this.recycleBinModel.findByUUID(req.session.user?.uuid || '')
    res.json(results)
  }
  @On(POST, '/')
  @BeforeMiddleware([verifyPermissions('ADD_ITEMS_TO_RECYCLE_BIN')])
  public async create(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    if (!req.body.path || !Array.isArray(req.body.path) || req.body.path?.length < 2) {
      res.status(403).json({
        code: 'bad-request',
        message: 'La ruta no es válida.'
      })
      return
    }
    const path = req.body.path || []
    const result = this.fsModel.resolvePath(req.session.user?.uuid || '', path, true)
    if (typeof result === 'boolean') {
      res.status(404).json({
        code: 'not-found',
        message: 'La ruta que indicaste no existe.'
      })
      return
    }
    await this.recycleBinModel.moveToRecycleBin(req.session.user?.uuid || '', result, path)
    res.json(true)
  }
  @On(PUT, '/:id')
  @BeforeMiddleware([verifyPermissions('RESTORE_ITEMS_TO_RECYCLE_BIN')])
  public async restore(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const { id } = req.params
    const result = await this.recycleBinModel.findByID(id)
    if (!result) {
      res.json(true)
      return
    }
    const path = this.fsModel.resolvePath(req.session.user?.uuid || '', result.path, false) as string
    await this.recycleBinModel.restore(req.session.user?.uuid || '', result.id, path)
    res.json(true)
  }
  @On(DELETE, '/:id')
  @BeforeMiddleware([verifyPermissions('DELETE_ITEMS_TO_RECYCLE_BIN')])
  public async delete(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    await this.recycleBinModel.delete(req.session.user?.uuid || '', req.params.id)
    res.json(true)
  }
  @On(DELETE, '/')
  @BeforeMiddleware([verifyPermissions('CLEAN_RECYCLE_BIN')])
  public async clean(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    await this.recycleBinModel.clean(req.session.user?.uuid || '')
    res.json(true)
  }
}