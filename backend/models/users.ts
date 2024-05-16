import type internal from 'node:stream'
import type { Database } from 'sqlite3'
import fs from 'node:fs'
import child from 'node:child_process'
import shellQuote from 'shell-quote'
import ini from 'ini'

declare const Library: PXIO.LibraryDecorator

interface RunOptions {
  title: string
  command: string
  args: string[]
  proc?: (stdin: internal.Writable) => void
}

const run = ({ title, command, args, proc }: RunOptions): Promise<void> => new Promise(resolve => {
  const TITLE = `[${title}]:`
  const child_process = child.spawn(command, args)
  child_process.on('close', resolve)
  child_process.stdout.on('data', (data) => console.log(TITLE, data.toString('utf8')))
  child_process.stderr.on('data', (data) => console.error(TITLE, data.toString('utf8')))
  if (proc) {
    proc(child_process.stdin)
  }
})

export class UsersModel {
  @Library('paths') paths: Paths.Class
  @Library('encrypt') encrypt: Encrypting.Class
  @Library('database') private database: Database
  private loadConfig(name?: Users.User['name']) {
    const SMB_CONFIG = fs.readFileSync(this.paths.samba, 'utf8')
    const smbConfig = ini.parse(SMB_CONFIG)
    if (name) {
      return smbConfig[name]
    }
    return smbConfig
  }
  private writeConfig(config: UserConfig): void {
    const smbStrConfig = ini.stringify(config)
    fs.writeFileSync(this.paths.samba, smbStrConfig, 'utf8')
    run({
      title: 'Restart Samba',
      command: '/etc/init.d/smbd',
      args: ['restart']
    })
  }
  private setConfig(name: string, config: UserConfig): void {
    const smbConfig = this.loadConfig()
    smbConfig[name] = {}
    const entries = Object.entries(config)
    for (const [key, value] of entries) {
      smbConfig[name][key] = value
    }
    this.writeConfig(smbConfig)
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
    await run({
      title: 'Create User',
      command: 'useradd',
      args: ['-m', '-G', 'lc', '-s', '/bin/bash', '-c', shellQuote.quote([[full_name, email, phone].join(',')]).replace(/\\/g, ''), name]
    })
    await run({
      title: 'Set Password To New User',
      command: 'passwd',
      args: [name],
      proc(stdin) {
        stdin.write(`${password}\n`)
        stdin.write(`${password}\n`)
        stdin.end()
      }
    })
    await run({
      title: 'Set New User In Samba',
      command: 'smbpasswd',
      args: ['-a', name],
      proc(stdin) {
        stdin.write(`${password}\n`)
        stdin.write(`${password}\n`)
        stdin.end()
      }
    })
    this.setConfig(name, {
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
    await run({
      title: `Update User ${name}`,
      command: 'usermod',
      args: ['-c', shellQuote.quote([[full_name, email, phone].join(',')]), name]
    })
  }
  public async updatePassword(name: Users.User['name'], password: string): Promise<void> {
    console.log(`----------------------------Update password: ${name}----------------------------`)
    const USER_NAME = shellQuote.quote([name])
    await run({
      title: `Update Password To User ${name}`,
      command: 'passwd',
      args: [USER_NAME],
      proc(stdin) {
        stdin.write(`${password}\n`)
        stdin.write(`${password}\n`)
        stdin.end()
      }
    })
    await run({
      title: `Delete ${name} In Samba`,
      command: 'smbpasswd',
      args: ['-x', USER_NAME]
    })
    await run({
      title: `Delete ${name} In Samba`,
      command: 'smbpasswd',
      args: ['-x', USER_NAME]
    })
    await run({
      title: `Set User ${name} In Samba`,
      command: 'smbpasswd',
      args: ['-a', USER_NAME],
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
    const USER_NAME = shellQuote.quote([name])
    await run({
      title: `Delete User ${name} In Samba`,
      command: 'smbpasswd',
      args: ['-x', USER_NAME]
    })
    await run({
      title: `Kill proccess Of ${name}`,
      command: 'pkill',
      args: ['-u', USER_NAME]
    })
    await run({
      title: `Delete User ${name}`,
      command: 'userdel',
      args: ['-r', USER_NAME]
    })
    const smbConfig = this.loadConfig()
    delete smbConfig[name]
    this.writeConfig(smbConfig)
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
}

interface Group {
  id: number
  name: string
  users: string[]
}
interface UserConfig {
  [x: string]: any
}