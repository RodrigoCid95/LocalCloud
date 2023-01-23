import { On, Socket, SocketResponse } from 'bitis/web-sockets'

export class Dumie {
  @On('login/sigin')
  public sigin(auth: boolean, socket: Socket) {
    socket.emit('auth/change', auth)
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