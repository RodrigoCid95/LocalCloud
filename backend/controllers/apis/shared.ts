import crypto from 'node:crypto'
import { verifySession } from './middlewares/session'
import { decryptRequest } from './middlewares/encrypt'
import { verifyPermission } from './middlewares/permissions'
import { SHARED } from 'libraries/classes/APIList'

@Namespace('api', 'shared')
@Middlewares({ before: [verifySession, decryptRequest] })
export class SharedAPIController {
  @Model('DevModeModel') public devModeModel: Models<'DevModeModel'>
  @Model('SharedModel') private sharedModel: Models<'SharedModel'>
  @Before([verifyPermission(SHARED.INDEX)])
  @Get('/')
  public async index(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const results = await this.sharedModel.find({ uid: req.session.user?.name })
    res.json(results)
  }
  @Before([verifyPermission(SHARED.CREATE)])
  @Post('/')
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
      const newShared: Shared.Shared = { id: crypto.randomUUID(), uid: uuid, path }
      await this.sharedModel.create(newShared)
      res.json(newShared)
    }
  }
  @Before([verifyPermission(SHARED.DELETE)])
  @Delete('/:id')
  public async delete(req: PXIOHTTP.Request, res: PXIOHTTP.Response): Promise<void> {
    const { id } = req.params
    await this.sharedModel.delete(id)
    res.json(true)
  }
}