import { Request, Response, beforeMiddelware } from 'phoenix-js/http'
import type { LocalCloud } from 'declarations'
import type { AppsModel, RolesModel, UsersModel, IndexModel } from 'models'
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
  public async test(req: Request<LocalCloud.SessionData>, res: Response): Promise<void> {
    /* await this.appsModel.create({
      packageName: 'com.users.sys',
      title: 'Usuarios',
      description: 'Gestor de usuarios del sistema.'
    }) */
    res.send('ok!')
  }
  @On(GET, '/404')
  public notFound(req: Request<LocalCloud.SessionData>, res: Response): void {
    res.render('index')
  }
}
export * from './app'
export * from './api/auth'
export * from './api/install'
export * from './api/profile'
export * from './api/users'