import Service from 'kernel/lib/Service'
import { LoginService, Credential } from '../types'

export default (ClassService: typeof Service) => {
  return class Service1 extends ClassService implements LoginService {
    public login(credential: Credential) {
      this.server.emit('auth signin', credential)
    }
  }
}