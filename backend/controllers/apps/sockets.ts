import { User } from 'types/Users'
import { Model } from 'bitis/core'
import { On, Prefix, Socket } from 'bitis/web-sockets'
import { AppsModel } from 'models'

@Prefix('apps-manager')
export class AppsController {
  @Model('AppsModel') private appsModel: AppsModel
  @On('find')
  public async app({ packageName, systemApp }, socket: Socket) {
    if (systemApp) {
      return await this.appsModel.getManifest(packageName)
    } else {
      const user: User | null = (socket.request as any).session?.user
      if (user) {
        return await this.appsModel.getManifest(packageName, user.uuid)
      }
      return null
    }
  }
  @On('get-all')
  public apps(socket: Socket) {
    return this.appsModel.getManifests(['com.app.one', 'com.app.two'])
  }
}