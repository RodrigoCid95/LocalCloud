import { Model } from 'bitis/core'
import { On, Socket, SocketResponse } from 'bitis/web-sockets'
import { DumieModel } from 'models'

export class Dumie {
  @Model('DumieModel') model: DumieModel

  @On('login/sigin')
  public sigin(auth: boolean, socket: Socket) {
    socket.emit('auth/change', auth)
  }
  @On('app')
  public app(packageName: string): SocketResponse {
    return {
      data: this.model.getManifest(packageName)
    }
  }
  @On('apps')
  public apps(): SocketResponse {
    return {
      data: [
        {
          packageNane: 'com.app.one',
          title: 'Test Application One',
          icon: ''
        },
        {
          packageNane: 'com.app.two',
          title: 'Test Application Two',
          icon: ''
        }
      ]
    }
  }
}