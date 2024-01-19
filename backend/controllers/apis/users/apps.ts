import type { Request, Response } from 'phoenix-js/http'
import type { LocalCloud } from 'declarations'
import type { AppsModel } from 'models/apps'
import { Model } from 'phoenix-js/core'
import { Prefix, On, Methods, beforeMiddelware } from 'phoenix-js/http'
import { verifySession } from 'controllers/middlewares/session'
import { userAccess } from 'controllers/middlewares/access'

const { GET } = Methods

@Prefix('api/user/apps')
export class AppsController {
  @Model('AppsModel') private model: AppsModel
  @On(GET, '/')
  @beforeMiddelware([verifySession, userAccess])
  public async index(req: Request<LocalCloud.SessionData>, res: Response): Promise<void> {
    const apps = await this.model.find()
    res.json(apps)
  }
}