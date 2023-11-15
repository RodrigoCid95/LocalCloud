import type { Request, Response } from 'phoenix-js/http'
import type { LocalCloud } from 'declarations'
import type { IndexModel, UsersModel, RolesModel } from 'models'
import { Model } from 'phoenix-js/core'
import { Prefix, On, Methods, beforeMiddelware } from 'phoenix-js/http'
import { decryptRequest } from '../middlewares/session'

const { POST } = Methods

@Prefix('api/install')
export class InstallController {
  @Model('WelcomeModel') private indexModel: IndexModel
  @Model('UsersModel') private usersModel: UsersModel
  @Model('RolesModel') private rolesModel: RolesModel
  @On(POST, '/')
  @beforeMiddelware([decryptRequest])
  public async install(req: Request<LocalCloud.SessionData>, res: Response): Promise<void> {
    const isInstall = await this.indexModel.checkInstallation()
    if (!isInstall) {
      const { userName, password, fullName } = req.body
      if (userName && password && fullName) {
        await this.indexModel.createDatabase()
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
}