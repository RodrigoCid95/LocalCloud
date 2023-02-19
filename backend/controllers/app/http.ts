import { Model } from 'bitis/core'
import path from 'path'
import { Prefix, Methods, On, Request, Response } from 'bitis/http'
import { AppsModel } from 'models'

const { GET } = Methods

@Prefix('app')
export class AppController {
  @Model('AppsModel') private appsModel: AppsModel
  @On(GET, '/system/:sysapp/*')
  public sysapp(req: Request, res: Response) {
    const file = req.params[0]
    if (file) {
      const packageName = req.params.sysapp
      const baseDir = this.appsModel.resolveAppDir(packageName)
      const filePath = path.resolve(baseDir, file)
      res.sendFile(filePath)
    } else {
      res.status(404).end()
    }
  }
  @On(GET, '/user/:usrapp/*')
  public app(req: Request, res: Response) {
    const file = req.params[0]
    const { user } = req.session as any
    if (file && user) {
      const packageName = req.params.usrapp
      const baseDir = this.appsModel.resolveAppDir(packageName, user.uuid)
      const filePath = path.resolve(baseDir, file)
      res.sendFile(filePath)
    } else {
      res.status(404).end()
    }
  }
}