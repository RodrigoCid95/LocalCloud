import Service from 'kernel/lib/Service'
import { LauncherService, Manifests } from '../types'

export default (ClassService: typeof Service) => {
  return class Service1 extends ClassService implements LauncherService {
    async getAppList() {
      return new Promise<Manifests>(resolve => this.server.socket.emit('apps', ({ data }) => resolve(data)))
    }
  }
}