import { TService } from 'builder'
import { IUsersService } from 'com.users.sys/types'

export default (Service: TService) => {
  return class UsersServices extends Service implements IUsersService {
  }
}