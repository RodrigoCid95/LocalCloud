import Service from 'kernel/lib/Service'
import { LoginService } from '../types'

export default (ClassService: typeof Service) => {
  return class Service1 extends ClassService implements LoginService {
    login() {
      this.server.emit('auth sigin')
    }
  }
}