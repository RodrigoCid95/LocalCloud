import { spawnSync } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'
import ini from 'ini'

export class SambaManager implements Samba.Manager {
  private config: string = path.resolve('/', 'etc', 'samba', 'smb.conf')
  private bin: string = path.resolve('/', 'etc', 'init.d', 'smbd')
  private home: string = path.resolve('/', 'home')

  constructor() {
    this.create('Carpeta Compartida', {
      comment: 'Carpeta Compartida',
      path: path.resolve('/', 'shared'),
      browsable: 'yes',
      writeable: 'yes',
      'guest ok': 'no',
      'valid users': '@lc'
    })
  }

  private loadConfig(): Samba.Configs {
    const SMB_CONFIG = fs.readFileSync(this.config, 'utf8')
    const smbConfig = ini.parse(SMB_CONFIG)
    return smbConfig
  }

  private saveConfig(config: Samba.Configs): void {
    const smbStrConfig = ini.stringify(config)
    fs.writeFileSync(this.config, smbStrConfig, 'utf8')
    spawnSync(this.bin, ['restart'], { stdio: 'inherit' })
  }

  public create(name: Users.User["name"], config: Samba.Config = {}, password?: string): void {
    const smbConfig = this.loadConfig()
    if (!smbConfig[name]) {
      const newConfig = {
        comment: `Directorio de ${name}`,
        path: path.join(this.home, name),
        browsable: 'yes',
        writable: 'yes',
        'guest ok': 'no',
        'valid users': name,
        'write list': name,
        'read only': 'yes'
      }
      smbConfig[name] = {}
      const entries = Object.entries(newConfig)
      for (const [key, value] of entries) {
        smbConfig[name][key] = config[key] || value
      }
      this.saveConfig(smbConfig)
      spawnSync('bash', ['-c', `echo -e "${password}\n${password}" | smbpasswd -a "${name}" > /dev/null`], { stdio: 'inherit' })
    }
  }

  public delete(name: Users.User["name"]): void {
    const smbConfig = this.loadConfig()
    if (smbConfig[name]) {
      delete smbConfig[name]
      this.saveConfig(smbConfig)
    }
  }
}