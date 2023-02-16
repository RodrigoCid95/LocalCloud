import { User } from 'types/Users'
import { Model } from 'bitis/core'
import { Prefix, Methods, On, Request, Response } from 'bitis/http'
import { AppsModel } from 'models'

const { POST } = Methods

@Prefix('apps-manager')
export class AppsController {
  @Model('AppsModel') private appsModel: AppsModel
  @On(POST, '/install')
  public async install(req: Request, res: Response) {
    const files: any = (req as any).files
    const user: User | null = (req.session as any).user
    if (files?.file && user) {
      let { name, data, mimetype } = files.file
      if (mimetype === 'application/zip') {
        try {
          await this.appsModel.install(user.uuid, (name as string).replace('.zip', ''), data)
        } catch (error) {
          res.status(500).send(error.message)
          return
        }
      }
    }
    res.status(200).send('Ok!')
  }
}