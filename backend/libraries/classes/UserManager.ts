import fs from 'node:fs'
import { GroupManager } from './GroupManager'
import { Encrypt } from './Encrypt'
import path from 'node:path'

const { shadow, passwd, users: { path: home } } = getConfig('paths')

export class UserManager implements UserManager.Class {
  #groupManager: GroupManager.Class
  #encrypt: Encrypt
  constructor() {
    this.#groupManager = new GroupManager()
    this.#encrypt = new Encrypt()
    if (!fs.existsSync(home)) {
      fs.mkdirSync(home)
    }
    if (!fs.existsSync(shadow)) {
      fs.writeFileSync(shadow, '', 'utf-8')
    }
    if (!fs.existsSync(passwd)) {
      fs.writeFileSync(passwd, '', 'utf-8')
    }
    this.updatePassword('test', '12341234')
  }
  #loadUsers(): Users.Result[] {
    const shadowContent = fs.readFileSync(shadow, 'utf8')
    const shadowLines = shadowContent
      .split('\n')
      .filter(line => line !== '')
      .map(line => {
        const [name, hash] = line.split(':')
        return { name, hash }
      })
    const groupUsers = this.#groupManager.getUsers()
    const content = fs.readFileSync(passwd, 'utf8')
    const users: Users.Result[] = content
      .split('\n')
      .filter(line => line !== '')
      .map(line => {
        const [name, _, uid, __, comment] = line.split(':')
        if (!groupUsers.includes(name)) {
          return null
        }
        const [full_name = '', email = '', phone = ''] = comment.split(',')
        return {
          name,
          uid: Number(uid),
          full_name,
          email,
          phone
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
  create(newUser: Users.New): Users.User['uid'] {
    const users = this.#groupManager.getUsers()
    if (!users.includes(newUser.name)) {
      const gid = this.#groupManager.addGroup(newUser.name)
      const passwdContent = fs.readFileSync(passwd, 'utf8')
      const uids = passwdContent
        .split('\n')
        .filter(line => line !== '')
        .map(line => Number(line.split(':')[2]))
      let newUid = 1000
      for (const uid of uids) {
        if (uid.toString().length === 4 && uid > newUid) {
          newUid = uid
        }
      }
      newUid++
      const newUserLine = `\n${newUser.name}:x:${newUid}:${gid}:${newUser.full_name},${newUser.email},${newUser.phone}:/home/${newUser.name}:`
      fs.appendFileSync(passwd, newUserLine, 'utf8')
      const currentDate = Math.floor(Date.now() / (1000 * 60 * 60 * 24))
      const encryptedPassword = this.#encrypt.createHash(newUser.password)
      const newShadowLine = `\n${newUser.name}:${encryptedPassword}:${currentDate}:0:99999:7:::`
      fs.appendFileSync(shadow, newShadowLine, 'utf8')
      const userPath = path.join(home, newUser.name)
      if (!fs.existsSync(userPath)) {
        fs.mkdirSync(userPath, { recursive: true })
      }
      if (getConfig('isRelease')) {
        fs.chownSync(userPath, newUid, gid)
      }
      const skelPath = path.resolve('/', 'etc', 'skel')
      const files = fs.readdirSync(skelPath)
      for (const file of files) {
        const filePath = path.join(skelPath, file)
        const destFilesPath = path.join(userPath, file)
        fs.copyFileSync(filePath, destFilesPath)
        if (getConfig('isRelease')) {
          fs.chownSync(destFilesPath, newUid, gid)
        }
      }
      this.#groupManager.addUser(newUser.name)
      return newUid
    }
    return this.get(newUser.name)?.uid || NaN
  }
  get(name: Users.User['name']): Users.Result | null {
    return this
      .#loadUsers()
      .find(user => user.name === name) || null
  }
  getAll(): Users.Result[] {
    return this.#loadUsers()
  }
  update(name: Users.User['name'], data: Partial<Users.User>): void {
    const users = this.#groupManager.getUsers()
    if (users.includes(name)) {
      const passwdContent = fs.readFileSync(passwd, 'utf8')
      const passwdLines = passwdContent
        .split('\n')
        .filter(line => line !== '')
      const userIndex = passwdLines
        .map(line => line.split(':'))
        .findIndex(user => user[0] === name)
      const line = passwdLines[userIndex].split(':')
      line[4] = `${data.full_name || ''},${data.email || ''},${data.phone || ''}`
      passwdLines[userIndex] = line.join(':')
      const newContent = passwdLines.join('\n')
      fs.writeFileSync(passwd, newContent, 'utf8')
    }
  }
  delete(uid: Users.User['uid']): void {
    const passwdContent = fs.readFileSync(passwd, 'utf8')
    const passwdLines = passwdContent
      .split('\n')
      .filter(line => line !== '')
    const userIndex = passwdLines
      .map(line => line.split(':'))
      .findIndex(user => user[2] === uid.toString())
    if (userIndex !== -1) {
      const name = passwdLines[userIndex].split(':')[0]
      passwdLines.splice(userIndex, 1)
      const newPasswdContent = passwdLines.join('\n')
      fs.writeFileSync(passwd, newPasswdContent, 'utf8')
      this.#groupManager.removeGroup(name)
      this.#groupManager.removeUser(name)
      const shadowContent = fs.readFileSync(shadow, 'utf8')
      const shadowLines = shadowContent
        .split('\n')
        .filter(line => line !== '')
      const shadowIndex = shadowLines
        .map(line => line.split(':'))
        .findIndex(user => user[0] === name)
      shadowLines.splice(shadowIndex, 1)
      const newShadowContent = shadowLines.join('\n')
      fs.writeFileSync(shadow, newShadowContent, 'utf8')
      fs.rmSync(path.join(home, name), { recursive: true })
    }
  }
  updatePassword(name: Users.User['name'], password: string): void {
    const hash = this.#encrypt.createHash(password)
    const shadowContent = fs.readFileSync(shadow, 'utf8')
    const shadowLines = shadowContent
      .split('\n')
      .filter(line => line !== '')
      .map(line => line.split(':'))
    const shadowIndex = shadowLines
      .findIndex(user => user[0] === name)
    if (shadowIndex !== -1) {
      shadowLines[shadowIndex][1] = hash
      const newShadowContent = shadowLines
        .map(line => line.join(':'))
        .join('\n')
      fs.writeFileSync(shadow, newShadowContent, 'utf8')
    }
  }
}