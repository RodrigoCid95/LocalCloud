import { Model } from 'bitis/core'
import { Prefix, On, Socket } from 'bitis/web-sockets'
import { UsersModel } from 'models'

@Prefix('users')
export class UsersController {
  @Model('UsersModel') private usersModel: UsersModel
  @On('find')
  public async find({ uuid }, socket: Socket) {
    
  }
}