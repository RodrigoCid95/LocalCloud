import { Request, Response } from 'phoenix-js/http'
import type { LocalCloud } from 'declarations'
import type { AppsModel, RolesModel, UsersModel, WelcomeModel } from 'models'
import { Model } from 'phoenix-js/core'
import { On, Methods, beforeMiddelware } from 'phoenix-js/http'
import { v4 } from 'uuid'
import { decryptRequest } from './middlewares/session'

const { GET, POST } = Methods

export class WelcomeController {
  @Model('AppsModel') private appsModel: AppsModel
  @Model('RolesModel') private rolesModel: RolesModel
  @Model('UsersModel') private usersModel: UsersModel
  @Model('WelcomeModel') private welcomeModel: WelcomeModel
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
  @On(POST, '/install')
  @beforeMiddelware([decryptRequest])
  public async install(req: Request<LocalCloud.SessionData>, res: Response): Promise<void> {
    const isInstall = await this.welcomeModel.checkInstallation()
    if (!isInstall) {
      const { userName, password, fullName } = req.body
      if (userName && password && fullName) {
        await this.welcomeModel.createDatabase()
        await this.usersModel.create({
          userName,
          password,
          fullName
        })
        await this.rolesModel.create({
          name: 'admin',
          description: 'Control total del sistema.',
          permissions: ['all']
        })
        const [{ uuid }] = await this.usersModel.find({ userName })
        await this.rolesModel.assignRolToUser({ id_rol: 1, uuid })
        res.send('ok!')
      } else {
        res.status(200)
      }
    } else {
      res.status(200)
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