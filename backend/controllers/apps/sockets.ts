import { User } from 'types/Users'
import { Model } from 'phoenix-js/core'
import { On, Prefix, Socket } from 'phoenix-js/web-sockets'
import { AppsModel } from 'models'

@Prefix('apps')
export class AppsController {
  @Model('AppsModel') private appsModel: AppsModel
  @On('manifest')
  public async getUserManifest({ packageName, uuid }, socket: Socket) {
    const user: User | undefined = (socket.request as any).session.user
    if (user) {
      if (uuid) {
        if (user.role === 'admin') {
          return await this.appsModel.getManifest(packageName, uuid)
        } else {
          throw new Error('No tienes permiso para hacer esto!')
        }
      } else {
        return await this.appsModel.getManifest(packageName, user.uuid)
      }
    } else {
      throw new Error('Es requerido un inicio de sesión!')
    }
  }
  @On('manifests')
  public async getManifests({ uuid }, socket: Socket) {
    const user: User | undefined = (socket?.request as any)?.session?.user
    if (user) {
      if (uuid) {
        if (user.role === 'admin') {
          return await this.appsModel.getManifests(uuid)
        } else {
          throw new Error('No tienes permiso para hacer esto!')
        }
      } else {
        return await this.appsModel.getManifests(user.uuid)
      }
    } else {
      throw new Error('Es requerido un inicio de sesión!')
    }
  }
  @On('uninstall')
  public async uninstall({ packageName, uuid }, socket: Socket) {
    const user: User | undefined = (socket.request as any).session.user
    if (user) {
      if (uuid) {
        if (user.role === 'admin') {
          await this.appsModel.uninstall(uuid, packageName)
        } else {
          throw new Error('No tienes permiso para hacer esto!')
        }
      } else {
        await this.appsModel.uninstall(user.uuid, packageName)
      }
    } else {
      throw new Error('Es requerido un inicio de sesión!')
    }
  }
}