import type { Database } from 'sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import ini from 'ini'

declare const Library: PXIO.LibraryDecorator

export class UsersModel {
  @Library('paths') paths: Paths.Class
  @Library('encrypt') encrypt: Encrypting.Class
  @Library('database') private database: Database
  @Library('process') private run: Process.Run
  private loadConfig(name?: Users.User['name']) {
    const SMB_CONFIG = fs.readFileSync(this.paths.samba, 'utf8')
    const smbConfig = ini.parse(SMB_CONFIG)
    if (name) {
      return smbConfig[name]
    }
    return smbConfig
  }
  private async writeConfig(config: UserConfig): Promise<void> {
    const smbStrConfig = ini.stringify(config)
    fs.writeFileSync(this.paths.samba, smbStrConfig, 'utf8')
    await this.run({
      title: 'Restart Samba',
      command: '/etc/init.d/smbd',
      args: ['restart']
    })
  }
  private async setConfig(name: string, config: UserConfig): Promise<void> {
    const smbConfig = this.loadConfig()
    smbConfig[name] = {}
    const entries = Object.entries(config)
    for (const [key, value] of entries) {
      smbConfig[name][key] = value
    }
    await this.writeConfig(smbConfig)
  }
  private loadGroup(): Group | undefined {
    const GROUP_CONTENT = fs.readFileSync(this.paths.groups, 'utf8')
    const GROUP_LINES = GROUP_CONTENT.split('\n').filter(line => line !== '')
    const GROUPS = GROUP_LINES
      .map(line => line.split(':'))
      .map(line => ({
        id: Number(line[2]),
        name: line[0],
        users: (line[3]).split(',')
      }))
    return GROUPS.filter(group => group.name === 'lc')[0]
  }
  private loadUserList(filter: boolean = false): Users.User[] {
    const { users } = this.loadGroup() as Group
    const PASSWD_CONTENT = fs.readFileSync(this.paths.passwd, 'utf8')
    const PASSWD_LINES = PASSWD_CONTENT.split('\n').filter(line => line !== '')
    const USER_LIST = PASSWD_LINES.map(line => {
      const user = line.split(':')
      const [full_name = '', email = '', phone = ''] = user[4].split(',')
      return {
        uid: Number(user[2]),
        name: user[0],
        full_name,
        email,
        phone
      }
    })
    if (filter) {
      return USER_LIST.filter(user => users.includes(user.name))
    }
    return USER_LIST
  }
  private loadHash(name: Users.User['name']): string {
    const SHADOW_CONTENT = fs.readFileSync(this.paths.shadow, 'utf8')
    const SHADOW_LINES = SHADOW_CONTENT.split('\n').filter(line => line !== '')
    const [[_, hash]] = SHADOW_LINES
      .map(line => line.split(':'))
      .filter(shadow => shadow[0] === name)
    return hash
  }
  public async createUser(user: Users.New): Promise<void> {
    const { name, password, full_name = '', email = '', phone = '' } = user
    console.log(`---------------------------- Create User: ${name} ----------------------------`)
    const PASSWORD = this.encrypt.createHash(password)
    await this.run({
      title: 'Create User',
      command: '/usr/sbin/useradd',
      args: ['-p', PASSWORD, '-m', '-G', 'lc', '-s', '/bin/bash', '-c', [full_name, email, phone].join(','), name]
    })
    await this.run({
      title: 'Set New User In Samba',
      command: 'smbpasswd',
      args: ['-a', name],
      proc(stdin) {
        stdin.write(`${password}\n`)
        stdin.write(`${password}\n`)
        stdin.end()
      }
    })
    await this.setConfig(name, {
      comment: `Directorio de ${name}`,
      path: `/home/${name}`,
      browsable: 'yes',
      writable: 'yes',
      'guest ok': 'no',
      'valid users': name,
      'write list': name,
      'read only': 'yes'
    })
    console.log('------------------------------ End Create User ----------------------------------')
  }
  public getUser(name: Users.User['name']): Users.User {
    const USER_LIST = this.loadUserList(true)
    const [user] = USER_LIST.filter(user => user.name === name)
    return user
  }
  public getUserByUID(uid: Users.User['uid']): Users.User {
    const USER_LIST = this.loadUserList(true)
    const [user] = USER_LIST.filter(user => user.uid === uid)
    return user
  }
  public getUsers(): Users.User[] {
    const USER_LIST = this.loadUserList(true)
    return USER_LIST
  }
  public verifyPassword(name: Users.User['name'], password: string): boolean {
    const hash = this.loadHash(name)
    return this.encrypt.verifyHash(password, hash)
  }
  public async updateUser(name: Users.User['name'], user: Omit<Omit<Users.User, 'name'>, 'uid'>): Promise<void> {
    const { full_name = '', email = '', phone = '' } = user
    await this.run({
      title: `Update User ${name}`,
      command: '/usr/sbin/usermod',
      args: ['-c', [full_name, email, phone].join(','), name]
    })
  }
  public async updatePassword(name: Users.User['name'], password: string): Promise<void> {
    console.log(`----------------------------Update password: ${name}----------------------------`)
    await this.run({
      title: `Update Password To User ${name}`,
      command: 'passwd',
      args: [name],
      proc(stdin) {
        stdin.write(`${password}\n`)
        stdin.write(`${password}\n`)
        stdin.end()
      }
    })
    await this.run({
      title: `Delete ${name} In Samba`,
      command: 'smbpasswd',
      args: ['-x', name]
    })
    await this.run({
      title: `Set User ${name} In Samba`,
      command: 'smbpasswd',
      args: ['-a', name],
      proc(stdin) {
        stdin.write(`${password}\n`)
        stdin.write(`${password}\n`)
        stdin.end()
      }
    })
    console.log('----------------------------End update password --------------------------------')
  }
  public async deleteUser(name: Users.User['name']) {
    console.log(`---------------------------- Delete User: ${name} ----------------------------`)
    await this.run({
      title: `Delete User ${name} In Samba`,
      command: 'smbpasswd',
      args: ['-x', name]
    })
    await this.run({
      title: `Kill proccess Of ${name}`,
      command: 'pkill',
      args: ['-u', name]
    })
    await this.run({
      title: `Delete User ${name}`,
      command: '/usr/sbin/userdel',
      args: ['-r', name]
    })
    const smbConfig = this.loadConfig()
    delete smbConfig[name]
    await this.writeConfig(smbConfig)
    const items = fs.readdirSync(this.paths.storages)
    for (const item of items) {
      const userStorage = path.join(item, name)
      if (fs.existsSync(userStorage)) {
        fs.rmSync(userStorage, { recursive: true, force: true })
      }
    }
    console.log('------------------------------ End Delete User ----------------------------------')
  }
  public async assignApp(uid: Users.User['uid'], package_name: string): Promise<void> {
    await new Promise(resolve => this.database.run(
      'INSERT INTO users_to_apps (uid, package_name) VALUES (?, ?);',
      [uid, package_name],
      resolve
    ))
  }
  public async unassignApp(uid: Users.User['uid'], package_name: string): Promise<void> {
    await new Promise(resolve => this.database.run(
      'DELETE FROM users_to_apps WHERE uid = ? AND package_name = ?;',
      [uid, package_name],
      resolve
    ))
  }
  public getUserConfig(name: Users.User['name']): Profile.Config {
    const userHomePath = path.join(this.paths.getUser(name), '.lc')
    if (fs.existsSync(userHomePath)) {
      const configContent = fs.readFileSync(userHomePath, 'utf8')
      return JSON.parse(configContent || '{}')
    }
    return {}
  }
  public setUserConfig(name: Users.User['name'], config: Profile.Config): void {
    const userHomePath = path.join(this.paths.getUser(name), '.lc')
    const configContent = JSON.stringify(config)
    fs.writeFileSync(userHomePath, configContent, 'utf8')
  }
}

interface Group {
  id: number
  name: string
  users: string[]
}
interface UserConfig {
  [x: string]: any
}