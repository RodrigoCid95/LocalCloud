import { BaseAPI } from "./BaseAPI"
import { PERMISSIONS, setPermission } from "./middlewares/permissions"
import { session } from "./middlewares/session"

@Namespace('api', 'sources')
@Middlewares({ before: [session] })
export class SourcesController extends BaseAPI {
  @Model('SourcesModel') private sourcesModel: Models<'SourcesModel'>

  public verifyID(req: PXIOHTTP.Request, res: PXIOHTTP.Response, next: Next): void {
    const { id } = req.params
    if (!/^(IM|ME|OB|SC|ST|WO|FO|CO):\d+$/.test(id)) {
      res.status(400).json({
        ok: false,
        code: 'id-invalid',
        message: 'El id es inválido.'
      })
      return
    }
    next()
  }

  @Before<SourcesController>([setPermission(PERMISSIONS.SOURCES_GET), 'verifyPermission'])
  @Get('/:package_name')
  public get(req: PXIOHTTP.Request, res: PXIOHTTP.Response): void {
    const { package_name: packageName } = req.params
    const results = this.sourcesModel.get(packageName)
    res.json(results)
  }

  @Before<SourcesController>([setPermission(PERMISSIONS.SOURCES_ENABLE), 'verifyPermission'])
  @After(['verifyID'])
  @Post('/:package_name/:id')
  public enable(req: PXIOHTTP.Request, res: PXIOHTTP.Response): void {
    const { package_name: packageName, id } = req.params
    this.sourcesModel.put(packageName, id, true)
    res.json({ ok: true })
    if (this.checkPermission(req, PERMISSIONS.SOURCES_CHANGE)) {
      io._nsps.get('/sources')?.to(req.session.id).emit(`/change/${packageName}`)
    }
  }

  @Before<SourcesController>([setPermission(PERMISSIONS.SOURCES_DISABLE), 'verifyPermission'])
  @After(['verifyID'])
  @Delete('/:package_name/:id')
  public disable(req: PXIOHTTP.Request, res: PXIOHTTP.Response): void {
    const { package_name: packageName, id } = req.params
    this.sourcesModel.put(packageName, id, false)
    res.json({ ok: true })
    if (this.checkPermission(req, PERMISSIONS.SOURCES_CHANGE)) {
      io._nsps.get('/sources')?.to(req.session.id).emit(`/change/${packageName}`)
    }
  }
}