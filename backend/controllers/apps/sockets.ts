import { Model } from 'bitis/core'
import { On, Prefix, Socket } from 'bitis/web-sockets'
import { AppsModel } from 'models'

@Prefix('apps-manager')
export class AppsController {
  @Model('AppsModel') private appsModel: AppsModel
  @On('find')
  public app({ packageName }, socket: Socket) {
    return this.appsModel.getManifest(packageName)
  }
  @On('get-all')
  public apps(socket: Socket) {
    return this.appsModel.getManifests(['com.app.one', 'com.app.two'])
  }
}