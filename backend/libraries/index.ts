import { Builder } from './classes/Builder'
import { DevMode } from './classes/DevMode'
import { Encrypt } from './classes/Encrypt'
import { GroupManager } from './classes/GroupManager'
import { UserManager } from './classes/UserManager'
import { SMBManager } from './classes/SMBManager'
import { Paths } from './classes/Paths'

export const builder = () => new Builder()
export const groupManager = () => new GroupManager()
export const userManager = () => new UserManager()
export const smbManager = async () => {
  const smbManager = new SMBManager()
  smbManager.create('Carpeta Compartida', {
    comment: 'Carpeta Compartida',
    path: configs.get('paths').users.shared,
    browsable: 'yes',
    writable: 'yes',
    'guest ok': 'no',
    'valid users': '@lc'
  })
  return smbManager
}
export const devMode = () => new DevMode()
export const encrypt = () => new Encrypt()
export const paths = () => new Paths()
export * from './database'
export * from './process'