import type { Database } from 'sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import ini from 'ini'

export class UsersModel {
  @Library('paths') paths: Paths.Class
  @Library('encrypt') encrypt: Encrypting.Class
  @Library('database') private database: Database
  @Library('userManager') private userManager: UserManager.Class
  @Library('smbManager') private smbManager: SMBManager.Class
  public async createUser(user: Users.New): Promise<void> {
    const { name, password, full_name = '', email = '', phone = '' } = user
    this.userManager.create({
      name,
      password,
      full_name,
      email,
      phone
    })
    await this.smbManager.create(name)
  }
  public getUser(name: Users.User['name']): Users.User | null {
    const result = this.userManager.get(name)
    if (result) {
      const { uid, name, full_name, email, phone } = result
      return { uid, name, full_name, email, phone }
    }
    return null
  }
  public getUserByUID(uid: Users.User['uid']): Users.User | null {
    const results = this.userManager.getAll()
    const user = results.find(user => user.uid === uid)
    if (user) {
      const { uid, name, full_name, email, phone } = user
      return { uid, name, full_name, email, phone }
    }
    return null
  }
  public getUsers(): Users.User[] {
    const results = this.userManager.getAll()
    const userList = results.map(({ uid, name, full_name, email, phone }) => ({ uid, name, full_name, email, phone }))
    return userList
  }
  public verifyPassword(name: Users.User['name'], password: string): boolean {
    const user = this.userManager.get(name)
    if (user) {
      return this.encrypt.verifyHash(password, user.password_hash)
    }
    return false
  }
  public updateUser(name: Users.User['name'], user: Omit<Omit<Users.User, 'name'>, 'uid'>) {
    const { full_name = '', email = '', phone = '' } = user
    this.userManager.update(name, { full_name, email, phone })
  }
  public updatePassword(name: Users.User['name'], password: string): void {
    this.userManager.updatePassword(name, password)
  }
  public async deleteUser(name: Users.User['name']) {
    const userToDelete = this.getUser(name)
    if (userToDelete) {
      this.userManager.delete(userToDelete.uid)
      await this.smbManager.delete(userToDelete.name)
    }
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