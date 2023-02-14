import { Model } from 'bitis/core'
import { Prefix, Methods, On, Request, Response } from 'bitis/http'
import { AppsManagerModel } from 'models'

const { POST } = Methods

@Prefix('apps-manager')
export class AppsManagerController {
  @Model('AppsManagerModel') private model: AppsManagerModel
  @On(POST, '/install')
  public async install(req: Request, res: Response) {
    const files: any = (req as any).files
    if (files?.file) {
      let { name, data, mimetype } = files.file
      if (mimetype === 'application/zip') {
        await this.model.install('rodrigo', (name as string).replace('.zip', ''), data)
      }
    }
    res.status(200).send('Ok!')
  }
}