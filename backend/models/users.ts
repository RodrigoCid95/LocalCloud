import type { Database } from 'sqlite3'
import fs from 'node:fs'
import child from 'node:child_process'
import shellQuote from 'shell-quote'

declare const Library: PXIO.LibraryDecorator

export class UsersModel {
  @Library('paths') paths: Paths.Class
  @Library('encrypt') encrypt: Encrypting.Class
  @Library('database') private database: Database
  constructor() {
    if (!this.loadGroup()) {
      child.execSync(`groupadd lc`)
    }
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
  public createUser(user: Users.New) {
    const { name, password, full_name = '', email = '', phone = '' } = user
    const PASSWORD = this.encrypt.createHash(password)
    const cmd = shellQuote.parse(
      `useradd PASSWORD -m -G $GROUP -s "$BASH" -c "$GECOS" $USER_NAME`,
      {
        GROUP: 'lc',
        BASH: '/bin/bash',
        GECOS: shellQuote.quote([[full_name, email, phone].join(',')]),
        USER_NAME: shellQuote.quote([name])
      }
    ).join(' ').replace('PASSWORD', `-p '${PASSWORD}'`)
    child.execSync(cmd)
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
    child.execSync(cmd).toString('utf8')
  }
  public updatePassword(userName: string, newPassword: string) {
    const PASSWORD = this.encrypt.createHash(newPassword)
    const cmd = shellQuote.parse(
      `usermod PASSWORD $USER_NAME`,
      {
        USER_NAME: shellQuote.quote([userName])
      }
    ).join(' ').replace('PASSWORD', `-p '${PASSWORD}'`)
    const res = child.execSync(cmd).toString('utf8')
    console.log(res)
  }
  public deleteUser(userName: string) {
    const USER_NAME = shellQuote.quote([userName])
    const KILL_CMD = shellQuote.parse(
      `pkill -u $USER_NAME`,
      { USER_NAME }
    ).join(' ')
    try {
      child.execSync(KILL_CMD)
    } catch (_) {
    }
    const DELETE_CMD = shellQuote.parse(
      `userdel -r -f $USER_NAME`,
      { USER_NAME }
    ).join(' ')
    child.execSync(DELETE_CMD)
  }
  public async assignApp(name: string, package_name: string): Promise<void> {
    await new Promise(resolve => this.database.run(
      'INSERT INTO users_to_apps (name, package_name) VALUES (?, ?);',
      [name, package_name],
      resolve
    ))
  }
  public async unassignApp(name: string, package_name: string): Promise<void> {
    await new Promise(resolve => this.database.run(
      'DELETE FROM users_to_apps WHERE name = ? AND package_name = ?;',
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