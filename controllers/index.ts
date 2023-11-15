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
          const apps = await this.appsModel.find()
          res.render('dashboard', { user: req.session.user, apps, key: req.session.key })
        }
      } else {
        res.render('login', { key: req.session.key })
      }
    } else {
      res.render('install', { key: req.session.key })
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
    res.render('404')
  }
}
export * from './app'
export * from './api/auth'
export * from './api/install'
export * from './api/users'