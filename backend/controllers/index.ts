import { Request, Response } from 'phoenix-js/http'
import type { LocalCloud } from 'declarations'
import type { AppsModel, RolesModel, UsersModel, IndexModel } from 'models'
import { Model } from 'phoenix-js/core'
import { On, Methods } from 'phoenix-js/http'
import { v4 } from 'uuid'

const { GET, POST } = Methods

export class IndexController {
  @Model('AppsModel') private appsModel: AppsModel
  @Model('RolesModel') private rolesModel: RolesModel
  @Model('UsersModel') private usersModel: UsersModel
  @Model('IndexModel') private welcomeModel: IndexModel
  @On(GET, '/')
  public async index(req: Request<LocalCloud.SessionData>, res: Response): Promise<void> {
    req.session.key = v4()
    const isInstall = await this.welcomeModel.checkInstallation()
    if (isInstall) {
      if (req.session.user) {
        const { dest } = req.query
        if (dest) {
          res.redirect(dest as string)
        } else {
          res.render('index', { key: req.session.key, bodyClass: 'logged-in' })
        }
      } else {
        res.render('index', { key: req.session.key, bodyClass: 'logged-out' })
      }
    } else {
      res.render('index', { key: req.session.key, bodyClass: 'installation' })
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