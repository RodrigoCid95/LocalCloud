import type { LocalCloud } from 'declarations'
import type { AppsModel, RolesModel, UsersModel, IndexModel } from 'models'
import { Request, Response, beforeMiddelware } from 'phoenix-js/http'
import { Model } from 'phoenix-js/core'
import { On, Methods } from 'phoenix-js/http'
import { tokens } from './middlewares/tokens'

const { GET, POST } = Methods

export class IndexController {
  @Model('AppsModel') private appsModel: AppsModel
  @Model('RolesModel') private rolesModel: RolesModel
  @Model('UsersModel') private usersModel: UsersModel
  @Model('IndexModel') private welcomeModel: IndexModel
  @On(GET, '/')
  @beforeMiddelware([tokens])
  public async index(req: Request<LocalCloud.SessionData>, res: Response): Promise<void> {
    const tokens = {
      key: req.session.key,
      systemToken: req.session.systemToken
    }
    const isInstall = await this.welcomeModel.checkInstallation()
    if (isInstall) {
      if (req.session.user) {
        const { dest } = req.query
        if (dest) {
          res.redirect(dest as string)
        } else {
          res.render('index', tokens)
        }
      } else {
        res.render('index', tokens)
      }
    } else {
      res.render('installation', tokens)
    }
  }
  @On(GET, '/test')
  @beforeMiddelware([tokens])
  public test(req: Request, res: Response): void {
    const tokens = {
      key: req.session.key,
      systemToken: req.session.systemToken
    }
    res.render('index', tokens)
  }
}
export * from './apis'
export * from './app'