import { verifySession } from './middlewares/session'
import { verifyPermission } from "./middlewares/permissions"
import { SOURCES } from 'libraries/classes/APIList'

@Namespace('api/sources')
@Middlewares({ before: [verifySession] })
export class SecureSourcesAPIController {
  @Model('DevModeModel') public devModeModel: Models<'DevModeModel'>
  @Model('SourcesModel') sourcesModel: Models<'SourcesModel'>
  @Before([verifyPermission(SOURCES.FIND)])
  @Get('/')
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
  @Before([verifyPermission(SOURCES.ENABLE)])
  @Post('/:id')
  public async enable(req: PXIOHTTP.Request, res: PXIOHTTP.Response): Promise<void> {
    const { id } = req.params
    await this.sourcesModel.setActive(id as unknown as number, true)
    res.json(true)
  }
  @Before([verifyPermission(SOURCES.DISABLE)])
  @Delete('/:id')
  public async disable(req: PXIOHTTP.Request, res: PXIOHTTP.Response): Promise<void> {
    const { id } = req.params
    await this.sourcesModel.setActive(id as unknown as number, false)
    res.json(true)
  }
}