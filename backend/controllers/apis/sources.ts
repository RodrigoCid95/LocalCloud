import { verifySession } from './middlewares/session'
import { verifyPermissions } from "./middlewares/permissions"

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const BeforeMiddleware: PXIOHTTP.BeforeMiddlewareDecorator
declare const METHODS: PXIOHTTP.METHODS

const { GET, POST, DELETE } = METHODS

@Namespace('api/sources', { before: [verifySession] })
export class SecureSourcesAPIController {
  @Model('DevModeModel') public devModeModel: Models<'DevModeModel'>
  @Model('SourcesModel') sourcesModel: Models<'SourcesModel'>
  @On(GET, '/')
  @BeforeMiddleware([verifyPermissions('SOURCE_LIST')])
  public async find(req: PXIOHTTP.Request, res: PXIOHTTP.Response) {
    const { package_name, type, active } = req.query
    const query: Partial<SecureSources.Source> = {}
    if (package_name) {
      query['package_name'] = package_name.toString()
    }
    if (type) {
      query['type'] = type.toString()
    }
    if (active !== undefined) {
      query['active'] = active === 'true'
    }
    const results = await this.sourcesModel.find(query)
    res.json(results)
  }
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