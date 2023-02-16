import { Model } from 'bitis/core'
import { On, Prefix, Socket } from 'bitis/web-sockets'
import { UsersModel } from 'models'
import { User } from 'types/Users'

@Prefix('auth')
export class AuthController {
  @Model('UsersModel') private usersModel: UsersModel
  @On('signin')
  public async signin({ name, password }: Credendials, socket: Socket) {
    if (name && password) {
      const result = await this.usersModel.getWithHash({ name })
      if (result) {
        const { hash } = result
        let userHashing = ''
        for (let i = 0; i < hash.length; i++) {
          userHashing += String.fromCharCode(hash.charCodeAt(i) ^ password.charCodeAt(i % password.length))
        }
        if (userHashing === name) {
          const { uuid, name, fullName, email, role } = result
          const user: User = { uuid, name, fullName, email, role };
          (socket.request as any).session.user = user;
          await new Promise(resolve => (socket.request as any).session.save(resolve))
        }
      }
    }
  }
  @On('test')
  public async test(socket: Socket) {
    (socket.request as any).session.auth = true;
    await new Promise(resolve => (socket.request as any).session.save(resolve))
    return true
  }
}
type Credendials = {
  name: string
  password: string
}