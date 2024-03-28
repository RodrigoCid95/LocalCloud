import { verifySession } from './middlewares/session'
import { verifyPermissions } from "./middlewares/permissions"

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const BeforeMiddleware: PXIOHTTP.BeforeMiddlewareDecorator
declare const METHODS: PXIOHTTP.METHODS

const { POST, DELETE } = METHODS

@Namespace('api/sources', { before: [verifySession] })
export class SecureSourcesController {
  @Model('SourcesModel') sourcesModel: Models<'SourcesModel'>
  @On(POST, '/:id')
  @BeforeMiddleware([verifyPermissions('ENABLE_SOURCE')])
  public async enable(req: PXIOHTTP.Request, res: PXIOHTTP.Response): Promise<void> {
    const { id } = req.params
    await this.sourcesModel.setActive(id as unknown as number, true)
    res.json(true)
  }
  @On(DELETE, '/:id')
  @BeforeMiddleware([verifyPermissions('DISABLE_SOURCE')])
  public async disable(req: PXIOHTTP.Request, res: PXIOHTTP.Response): Promise<void> {
    const { id } = req.params
    await this.sourcesModel.setActive(id as unknown as number, false)
    res.json(true)
  }
}