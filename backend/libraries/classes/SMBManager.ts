import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import ini from 'ini'

const { samba, users: { path: home } } = getConfig('paths')

export class SMBManager implements SMBManager.Class {
  constructor() {
    if (!fs.existsSync(samba)) {
      fs.mkdirSync(path.dirname(samba))
      fs.writeFileSync(samba, '', 'utf-8')
    }
  }
  #loadConfig(name?: Users.User['name']) {
    const SMB_CONFIG = fs.readFileSync(samba, 'utf8')
    const smbConfig = ini.parse(SMB_CONFIG)
    if (name) {
      return smbConfig[name]
    }
    return smbConfig
  }
  #writeConfig(config: UserConfig): void {
    const smbStrConfig = ini.stringify(config)
    fs.writeFileSync(samba, smbStrConfig, 'utf8')
    if (getConfig('isRelease')) {
      spawnSync('/etc/init.d/smbd', ['restart'], { stdio: 'inherit' })
    }
  }
  create(name: Users.User["name"], config?: UserConfig): void {
    const smbConfig = this.#loadConfig()
    if (!smbConfig[name]) {
      const newConfig = {
        comment: `Directorio de ${name}`,
        path: path.join(home, name),
        browsable: 'yes',
        writable: 'yes',
        'guest ok': 'no',
        'valid users': name,
        'write list': name,
        'read only': 'yes'
      }
      smbConfig[name] = {}
      const entries = Object.entries(config || newConfig)
      for (const [key, value] of entries) {
        smbConfig[name][key] = value
      }
      this.#writeConfig(smbConfig)
    }
  }
  delete(name: Users.User["name"]): void {
    const smbConfig = this.#loadConfig()
    if (smbConfig[name]) {
      delete smbConfig[name]
      this.#writeConfig(smbConfig)
    }
  }
}

interface UserConfig {
  [x: string]: any
}