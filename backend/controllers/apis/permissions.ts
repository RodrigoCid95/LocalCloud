import { verifySession } from "./middlewares/session"
import { verifyPermissions } from "./middlewares/permissions"

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const BeforeMiddleware: PXIOHTTP.BeforeMiddlewareDecorator
declare const METHODS: PXIOHTTP.METHODS

const { PUT, DELETE } = METHODS

@Namespace('api/permissions', { before: [verifySession] })
export class PermissionsController {
  @Model('PermissionsModel') permissionModel: Models<'PermissionsModel'>
  @On(PUT, '/:id')
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