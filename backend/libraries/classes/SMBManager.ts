import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import ini from 'ini'

const { samba, users: { path: home } } = configs.get('paths')

export class SMBManager implements SMBManager.Class {
  constructor() {
    if (!fs.existsSync(samba)) {
      fs.mkdirSync(path.dirname(samba))
      fs.writeFileSync(samba, '', 'utf-8')
    }
    this.create('test')
    this.delete('test')
  }
  #loadConfig(name?: Users.User['name']) {
    const SMB_CONFIG = fs.readFileSync(samba, 'utf8')
    const smbConfig = ini.parse(SMB_CONFIG)
    if (name) {
      return smbConfig[name]
    }
    return smbConfig
  }
  async #writeConfig(config: UserConfig): Promise<void> {
    const smbStrConfig = ini.stringify(config)
    fs.writeFileSync(samba, smbStrConfig, 'utf8')
    if (isRelease) {
      const sambaPath = path.resolve('/', 'etc', 'init.d', 'smbd')
      if (fs.existsSync(sambaPath)) {
        await new Promise<void>(resolve => {
          const child_process = spawn(sambaPath, ['restart'])
          child_process.on('close', resolve)
          child_process.stdout.on('data', (data) => console.log(data.toString('utf8')))
          child_process.stderr.on('data', (data) => console.error(data.toString('utf8')))
          child_process.on('error', (error) => console.log(error.message))
        })
      }
    }
  }
  async create(name: Users.User["name"], config?: UserConfig): Promise<void> {
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
      await this.#writeConfig(smbConfig)
    }
  }
  async delete(name: Users.User["name"]): Promise<void> {
    const smbConfig = this.#loadConfig()
    if (smbConfig[name]) {
      delete smbConfig[name]
      await this.#writeConfig(smbConfig)
    }
  }
}

interface UserConfig {
  [x: string]: any
}