import { verifySession } from './middlewares/session'
import { verifyPermission } from "./middlewares/permissions"
import { SOURCES } from 'libraries/classes/APIList'

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
  @BeforeMiddleware([verifyPermission(SOURCES.FIND)])
  public async find(req: PXIOHTTP.Request, res: PXIOHTTP.Response) {
    const { package_name, type, active } = req.query
    const query: Partial<SecureSources.Source> = {}
    if (package_name) {
      query['package_name'] = package_name.toString()
    }
    if (type) {
      const t = type.toString() as string
      if (['image', 'media', 'object', 'script', 'style', 'worker', 'font', 'connect'].includes(t)) {
        query['type'] = (t as SecureSources.Source['type'])
      }
    }
    if (active !== undefined) {
      query['active'] = active === 'true'
    }
    const results = await this.sourcesModel.find(query)
    res.json(results)
  }
  @On(POST, '/:id')
  @BeforeMiddleware([verifyPermission(SOURCES.ENABLE)])
  public async enable(req: PXIOHTTP.Request, res: PXIOHTTP.Response): Promise<void> {
    const { id } = req.params
    await this.sourcesModel.setActive(id, true)
    res.json(true)
  }
  @On(DELETE, '/:id')
  @BeforeMiddleware([verifyPermission(SOURCES.DISABLE)])
  public async disable(req: PXIOHTTP.Request, res: PXIOHTTP.Response): Promise<void> {
    const { id } = req.params
    await this.sourcesModel.setActive(id, false)
    res.json(true)
  }
}