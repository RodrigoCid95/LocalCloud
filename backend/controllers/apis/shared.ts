import { v4 } from 'uuid'
import { verifySession } from './middlewares/session'
import { decryptRequest } from './middlewares/encrypt'
import { verifyPermission } from './middlewares/permissions'
import { SHARED } from 'libraries/classes/APIList'

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
  @BeforeMiddleware([verifyPermission(SHARED.INDEX)])
  public async index(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const results = await this.sharedModel.find({ uid: req.session.user?.name })
    res.json(results)
  }
  @On(POST, '/')
  @BeforeMiddleware([verifyPermission(SHARED.CREATE)])
  public async create(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { path } = req.body as unknown as Partial<Shared.New>
    if (!path) {
      res.status(400).json({
        code: 'fields-required',
        message: 'Faltan campos!'
      })
      return
    }
    const uuid = req.session.user?.name || ''
    const [result] = await this.sharedModel.find({ uid: uuid, path })
    if (result) {
      res.json(result)
    } else {
      const newShared: Shared.Shared = { id: v4(), uid: uuid, path }
      await this.sharedModel.create(newShared)
      res.json(newShared)
    }
  }
  @On(DELETE, '/:id')
  @BeforeMiddleware([verifyPermission(SHARED.DELETE)])
  public async delete(req: PXIOHTTP.Request, res: PXIOHTTP.Response): Promise<void> {
    const { id } = req.params
    await this.sharedModel.delete(id)
    res.json(true)
  }
}