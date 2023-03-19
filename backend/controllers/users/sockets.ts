import { Model } from 'phoenix-js/core'
import { Prefix, On, Socket } from 'phoenix-js/web-sockets'
import { UsersModel } from 'models'

@Prefix('users')
export class UsersController {
  @Model('UsersModel') private usersModel: UsersModel
  @On('find')
  public async find({ uuid }, socket: Socket) {
    
  }
}