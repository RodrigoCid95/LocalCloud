import fs from 'node:fs'
import path from 'node:path'
import { quote } from 'shell-quote'
import { GroupManager } from './GroupsManager'
import { process } from './process'
import { Encrypt } from './Encrypt'

export class UsersManager implements Users.Manager {
  private groupManager: Groups.Manager = new GroupManager()
  private encrypt: Encrypting.Encrypt = new Encrypt()
  private shadow: string = path.resolve('/', 'etc', 'shadow')
  private passwd: string = path.resolve('/', 'etc', 'passwd')
  private process: Process.Run = process()

  private async loadUsers(all: boolean = false): Promise<Users.Result[]> {
    const shadowContent = fs.readFileSync(this.shadow, 'utf8')
    const shadowLines = shadowContent
      .split('\n')
      .filter(line => line !== '')
      .map(line => {
        const [name, hash] = line.split(':')
        return { name, hash }
      })
    const groupUsers = await this.groupManager.getUsers()
    const content = fs.readFileSync(this.passwd, 'utf8')
    const users: Users.Result[] = content
      .split('\n')
      .filter(line => line !== '')
      .map(line => {
        const [name, _, uid, __, comment] = line.split(':')
        let isUserSystem = !groupUsers.includes(name)
        if (isUserSystem && !all) {
          return null
        }
        const [fullName = '', email = '', phone = ''] = comment
          .replaceAll('\\', '')
          .replaceAll("'", '')
          .split(',')
        return {
          name,
          uid: Number(uid),
          fullName,
          email,
          phone,
          isUserSystem
        }
      })
      .filter(line => line !== null)
      .map(line => {
        const shadowLine = shadowLines.find(shadowLine => shadowLine.name === line.name)
        return {
          ...line,
          password_hash: shadowLine?.hash || ''
        }
      })
    return users
  }

  public async create(newUser: Users.New): Promise<Users.User["uid"]> {
    let user = await this.get(newUser.name)
    if (user) {
      return user.uid
    }
    const comment = quote([[newUser.fullName, newUser.email, newUser.phone].join(',')])
    const name = quote([newUser.name])
    await this.process({
      title: `Create User (${newUser.name})`,
      command: 'useradd',
      args: ['-m', '-s', '/bin/bash', name, '-c', comment]
    })
    await this.setPassword(newUser.name, newUser.password)
    await this.process({
      title: `Add User (${newUser.name}) To LC Group`,
      command: 'usermod',
      args: ['-aG', 'lc', name]
    })
    return this.create(newUser)
  }

  public async get(name: Users.User["name"]): Promise<Users.Result | null> {
    const users = await this
      .loadUsers(true)
    const user = users.find(user => user.name === name)
    return user || null
  }

  public getAll(includeUserSystem?: boolean): Promise<Users.Result[]> {
    return this.loadUsers(includeUserSystem)
  }

  public async update(name: Users.User["name"], data: Partial<Users.User>): Promise<void> {
    const user = await this.get(name)
    if (user) {
      const fullName = data.fullName === undefined ? user.fullName : data.fullName
      const email = data.email === undefined ? user.email : data.email
      const phone = data.phone === undefined ? user.phone : data.phone
      await this.process({
        title: `Modify User (${name})`,
        command: 'usermod',
        args: ['-c', `"${[fullName, email, phone].join(',')}"`, quote([name])]
      })
    }
  }

  public async delete(uid: Users.User["uid"]): Promise<void> {
    const users = await this.loadUsers()
    const user = users.find(u => u.uid === uid)
    if (user) {
      await this.process({
        title: `Delete User (${user.name})`,
        command: 'deluser',
        args: ['--remove-all-files', user.name]
      })
    }
  }

  public async setPassword(name: Users.User["name"], password: string): Promise<void> {
    const user = await this.get(name)
    if (user) {
      const hash = await this.encrypt.createHash(password)
      await this.process({
        title: `Set Password To User (${name})`,
        command: 'usermod',
        args: ['-p', hash, name]
      })
    }
  }
}