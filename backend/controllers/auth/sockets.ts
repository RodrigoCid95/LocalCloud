import { Model } from 'bitis/core'
import { IO, On, Prefix, Socket } from 'bitis/web-sockets'
import { AuthModel, CipherModel } from 'models'

@Prefix('auth')
export class AuthController {
  @Model('AuthModel') private authModel: AuthModel
  @Model('CipherModel') private cipherModel: CipherModel
  private io: IO
  @On('sigin')
  public sigin(socket: Socket) {
    this.cipherModel.encrypt(true, socket.id).then(data =>
      this.io.to(socket.id).emit('auth/change', data)
    )
  }
  @On('test')
  public test() {
    console.log(arguments)
  }
}