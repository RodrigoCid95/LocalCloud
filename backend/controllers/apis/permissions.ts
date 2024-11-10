import { verifySession } from "./middlewares/session"
import { verifyPermission } from "./middlewares/permissions"
import { PERMISSIONS } from 'libraries/classes/APIList'

@Namespace('api', 'permissions')
@Middlewares({ before: [verifySession] })
export class PermissionsAPIController {
  @Model('DevModeModel') public devModeModel: Models<'DevModeModel'>
  @Model('PermissionsModel') permissionModel: Models<'PermissionsModel'>
  @Before([verifyPermission(PERMISSIONS.FIND)])
  @Get('/')
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
  @Before([verifyPermission(PERMISSIONS.ENABLE)])
  @Post('/:id')
  public async enable(req: PXIOHTTP.Request, res: PXIOHTTP.Response): Promise<void> {
    const { id } = req.params
    await this.permissionModel.setActive(id as unknown as number, true)
    res.json(true)
  }
  @Before([verifyPermission(PERMISSIONS.DISABLE)])
  @Delete('/:id')
  public async disable(req: PXIOHTTP.Request, res: PXIOHTTP.Response): Promise<void> {
    const { id } = req.params
    await this.permissionModel.setActive(id as unknown as number, false)
    res.json(true)
  }
}