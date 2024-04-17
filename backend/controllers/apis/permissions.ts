import { verifySession } from "./middlewares/session"
import { verifyPermissions } from "./middlewares/permissions"

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const BeforeMiddleware: PXIOHTTP.BeforeMiddlewareDecorator
declare const METHODS: PXIOHTTP.METHODS

const { GET, POST, DELETE } = METHODS

@Namespace('api/permissions', { before: [verifySession] })
export class PermissionsAPIController {
  @Model('DevModeModel') public devModeModel: Models<'DevModeModel'>
  @Model('PermissionsModel') permissionModel: Models<'PermissionsModel'>
  @On(GET, '/')
  @BeforeMiddleware([verifyPermissions('PERMISSION_LIST')])
  public async find(req: PXIOHTTP.Request, res: PXIOHTTP.Response): Promise<void> {
    const { package_name, api, active } = req.query
    const query: Partial<Permissions.Result> = {}
    if (package_name) {
      query['package_name'] = package_name.toString()
    }
    if (api) {
      query['api'] = api.toString()
    }
    if (active !== undefined) {
      query['active'] = active === 'true'
    }
    const results = await this.permissionModel.find(query)
    res.json(results)
  }
  @On(POST, '/:id')
  @BeforeMiddleware([verifyPermissions('ENABLE_PERMISSION')])
  public async enable(req: PXIOHTTP.Request, res: PXIOHTTP.Response): Promise<void> {
    const { id } = req.params
    await this.permissionModel.setActive(id as unknown as number, true)
    res.json(true)
  }
  @On(DELETE, '/:id')
  @BeforeMiddleware([verifyPermissions('DISABLE_PERMISSION')])
  public async disable(req: PXIOHTTP.Request, res: PXIOHTTP.Response): Promise<void> {
    const { id } = req.params
    await this.permissionModel.setActive(id as unknown as number, false)
    res.json(true)
  }
}