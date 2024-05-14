import type { Database } from 'sqlite3'
import fs from 'node:fs'
import child from 'node:child_process'
import shellQuote from 'shell-quote'
import ini from 'ini'

declare const Library: PXIO.LibraryDecorator

export class UsersModel {
  @Library('paths') paths: Paths.Class
  @Library('encrypt') encrypt: Encrypting.Class
  @Library('database') private database: Database
  constructor() {
    if (!this.loadGroup()) {
      console.log('(groupadd lc):', child.execSync('groupadd lc').toString('utf8'))
    }
    if (!this.loadConfig('Carpeta Compartida')) {
      this.setConfig('Carpeta Compartida', {
        comment: 'Carpeta Compartida',
        path: '/shared',
        browsable: 'yes',
        writable: 'yes',
        'guest ok': 'no',
        'valid users': '@lc'
      })
    }
  }
  private loadConfig(name?: string) {
    const SMB_CONFIG = fs.readFileSync('/etc/samba/smb.conf', 'utf8')
    const smbConfig = ini.parse(SMB_CONFIG)
    if (name) {
      return smbConfig[name]
    }
    return smbConfig
  }
  private writeConfig(config: any) {
    const smbStrConfig = ini.stringify(config)
    fs.writeFileSync(this.paths.samba, smbStrConfig, 'utf8')
    console.log(child.execSync('/etc/init.d/smbd restart').toString('utf8'))
  }
  private setConfig(name: string, config: { [x: string]: any }) {
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
        id: Number(user[2]),
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
  private loadHash(userName: string): string {
    const SHADOW_CONTENT = fs.readFileSync(this.paths.shadow, 'utf8')
    const SHADOW_LINES = SHADOW_CONTENT.split('\n').filter(line => line !== '')
    const [[_, hash]] = SHADOW_LINES
      .map(line => line.split(':'))
      .filter(shadow => shadow[0] === userName)
    return hash
  }
  public async createUser(user: Users.New) {
    const { name, password, full_name = '', email = '', phone = '' } = user
    const PASSWORD = this.encrypt.createHash(password)
    const cmd = `useradd -p '${PASSWORD}' -m -G lc -s /bin/bash -c ${shellQuote.quote([[full_name, email, phone].join(',')]).replace(/\\/g, '')} ${name}`
    await new Promise<void>(resolve => child.exec(cmd, () => resolve()))
    await new Promise<void>(resolve => {
      const child_process = child.spawn('smbpasswd', ['-a', name])
      child_process.on('close', resolve)
      child_process.stdin.write(`${password}\n`)
      child_process.stdin.write(`${password}\n`)
      child_process.stdin.end()
    })
    this.setConfig(name, {
      comment: `Directorio ${name}`,
      path: `/home/${name}`,
      browsable: 'yes',
      writable: 'yes',
      'guest ok': 'no',
      'valid users': name,
      'write list': name,
      'read only': 'yes'
    })
  }
  public getUser(userName: string): Users.User {
    const USER_LIST = this.loadUserList(true)
    const [user] = USER_LIST.filter(user => user.name === userName)
    return user
  }
  public getUsers(): Users.User[] {
    const USER_LIST = this.loadUserList(true)
    return USER_LIST
  }
  public verifyPassword(userName: string, password: string): boolean {
    const hash = this.loadHash(userName)
    return this.encrypt.verifyHash(password, hash)
  }
  public updateUser(userName: string, user: Omit<Omit<Users.User, 'name'>, 'id'>) {
    const { full_name = '', email = '', phone = '' } = user
    const newValue = [full_name, email, phone].join(',')
    const cmd = shellQuote.parse(
      'usermod -c "$GECOS" $USER_NAME',
      {
        GECOS: shellQuote.quote([newValue]),
        USER_NAME: userName
      }
    ).join(' ')
    console.log(`(${cmd}):`, child.execSync(cmd).toString('utf8'))
  }
  public async updatePassword(name: string, password: string) {
    const PASSWORD = this.encrypt.createHash(password)
    let cmd = shellQuote.parse(
      `usermod PASSWORD $USER_NAME`,
      { USER_NAME: shellQuote.quote([name]) }
    ).join(' ').replace('PASSWORD', `-p '${PASSWORD}'`)
    console.log(`(${cmd}):`, child.execSync(cmd).toString('utf8'))
    cmd = shellQuote.parse(
      `smbpasswd -x $USER_NAME`,
      { USER_NAME: shellQuote.quote([name]) }
    ).join(' ')
    console.log(`(${cmd}):`, child.execSync(cmd).toString('utf8'))
    await new Promise<void>(resolve => {
      const child_process = child.spawn('smbpasswd', [name])
      child_process.on('close', resolve)
      child_process.stdin.write(`${password}\n`)
      child_process.stdin.write(`${password}\n`)
      child_process.stdin.end()
    })
  }
  public async deleteUser(userName: string) {
    const USER_NAME = shellQuote.quote([userName])
    console.log(USER_NAME)
    await new Promise<void>(resolve => {
      const child_process = child.spawn('smbpasswd', ['-x', USER_NAME])
      child_process.stderr.on('error', (error) => console.trace(error))
      child_process.on('close', resolve)
    })
    await new Promise<void>(resolve => {
      const child_process = child.spawn('pkill', ['-u', USER_NAME])
      child_process.stderr.on('error', (error) => console.trace(error))
      child_process.on('close', resolve)
    })
    await new Promise<void>(resolve => {
      const child_process = child.spawn('userdel', ['-r', USER_NAME])
      child_process.stderr.on('error', (error) => console.trace(error))
      child_process.on('close', resolve)
    })
    const smbConfig = this.loadConfig()
    delete smbConfig[userName]
    this.writeConfig(smbConfig)
  }
  public async assignApp(name: string, package_name: string): Promise<void> {
    await new Promise(resolve => this.database.run(
      'INSERT INTO users_to_apps (user_name, package_name) VALUES (?, ?);',
      [name, package_name],
      resolve
    ))
  }
  public async unassignApp(name: string, package_name: string): Promise<void> {
    await new Promise(resolve => this.database.run(
      'DELETE FROM users_to_apps WHERE user_name = ? AND package_name = ?;',
      [name, package_name],
      resolve
    ))
  }
}

interface Group {
  id: number
  name: string
  users: string[]
}