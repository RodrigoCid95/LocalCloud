import { Model } from 'bitis/core'
import { On, Prefix, Socket } from 'bitis/web-sockets'
import { AppsManagerModel } from 'models'

@Prefix('apps-manager')
export class AppsManagerController {
  @Model('AppsManagerModel') private appsManagerModel: AppsManagerModel
  @On('find')
  public app({ packageName }, socket: Socket) {
    return this.appsManagerModel.getManifest(packageName)
  }
  @On('get-all')
  public apps(socket: Socket) {
    return this.appsManagerModel.getManifests(['com.app.one', 'com.app.two'])
  }
}