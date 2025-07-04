import { BaseAPI } from "./BaseAPI"
import { PERMISSIONS, setPermission } from "./middlewares/permissions"

@Namespace('api', 'permissions')
export class PermissionsController extends BaseAPI {
  @Model('PermissionsModel') private permissionsModel: Models<'PermissionsModel'>

  @Before<PermissionsController>([setPermission(PERMISSIONS.PERMISSIONS_GET), 'verifyPermission'])
  @Get('/:package_name')
  public get(req: PXIOHTTP.Request, res: PXIOHTTP.Response): void {
    const permissions = this.permissionsModel.get(req.params.package_name)
    res.json({ ok: true, permissions })
  }

  @Before<PermissionsController>([setPermission(PERMISSIONS.PERMISSIONS_ENABLE), 'verifyPermission'])
  @Post('/:package_name/:id')
  public enable(req: PXIOHTTP.Request, res: PXIOHTTP.Response): void {
    this.permissionsModel.put(req.params.package_name, req.params.id, true)
    res.json({ ok: true })
    if (this.checkPermission(req, PERMISSIONS.PERMISSIONS_CHANGE)) {
      io._nsps.get('/permissions')?.to(req.session.id).emit(`/change/${req.params.package_name}`)
    }
  }

  @Before<PermissionsController>([setPermission(PERMISSIONS.PERMISSIONS_DISABLE), 'verifyPermission'])
  @Delete('/:package_name/:id')
  public disable(req: PXIOHTTP.Request, res: PXIOHTTP.Response): void {
    this.permissionsModel.put(req.params.package_name, req.params.id, true)
    res.json({ ok: true })
    if (this.checkPermission(req, PERMISSIONS.PERMISSIONS_CHANGE)) {
      io._nsps.get('/permissions')?.to(req.session.id).emit(`/change/${req.params.package_name}`)
    }
  }
}