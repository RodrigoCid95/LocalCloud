import { v4 } from 'uuid'
import { verifySession } from './middlewares/session'
import { decryptRequest } from './middlewares/encrypt'
import { verifyPermissions } from './middlewares/permissions'

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const METHODS: PXIOHTTP.METHODS
declare const BeforeMiddleware: PXIOHTTP.BeforeMiddlewareDecorator

const { GET, POST, DELETE } = METHODS

@Namespace('/api/shared', { before: [verifySession, decryptRequest] })
export class SharedAPIController {
  @Model('DevModeModel') public devModeModel: Models<'DevModeModel'>
  @Model('SharedModel') private sharedModel: Models<'SharedModel'>
  @On(GET, '/')
  @BeforeMiddleware([verifyPermissions('SHARED_LIST')])
  public async index(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const results = await this.sharedModel.find({ uuid: req.session.user?.uuid })
    res.json(results)
  }
  @On(POST, '/')
  @BeforeMiddleware([verifyPermissions('SHARED_CREATE')])
  public async create(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { path } = req.body as unknown as Partial<Shared.New>
    if (!path) {
      res.status(400).json({
        code: 'fields-required',
        message: 'Faltan campos!'
      })
      return
    }
    const uuid = req.session.user?.uuid || ''
    const [result] = await this.sharedModel.find({ uuid, path })
    if (result) {
      res.json(result)
    } else {
      const newShared: Shared.Shared = { id: v4(), uuid, path }
      await this.sharedModel.create(newShared)
      res.json(newShared)
    }
  }
  @On(DELETE, '/:id')
  @BeforeMiddleware([verifyPermissions('SHARED_DELETE')])
  public async delete(req: PXIOHTTP.Request, res: PXIOHTTP.Response): Promise<void> {
    const { id } = req.params
    await this.sharedModel.delete(id)
    res.json(true)
  }
}