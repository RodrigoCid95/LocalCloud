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
      data: this.model.getManifests(['com.app.one', 'com.app.two'])
    }
  }
}