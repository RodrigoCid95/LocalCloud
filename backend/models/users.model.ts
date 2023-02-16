import { NewUser, User, ResultUser } from "types/Users"
import { CipherClass } from "types/Cipher"
import { FieldTypes, SQLiteClass } from 'types/SQLite'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { Lib } from "bitis/core"
import { v4 } from 'uuid'

export class UsersModel {
  @Lib('sqlite') private sqlite: SQLiteClass
  @Lib('cipher') public cipher: CipherClass
  private usersPath: string
  private usersDBPath: string
  constructor() {
    const baseDir = os.homedir()
    this.usersPath = path.join(baseDir, 'users')
    this.usersDBPath = path.join(baseDir, 'LocalCloud.db')
    if (!fs.existsSync(this.usersDBPath)) {
      fs.writeFileSync(this.usersDBPath, '', { encoding: 'utf8' })
    }
    this.sqlite.createTable(
      this.usersDBPath,
      'users',
      [
        {
          name: 'uuid',
          type: FieldTypes.STRING,
          notNull: true,
          primaryKey: true
        },
        {
          name: 'name',
          type: FieldTypes.STRING,
          notNull: true
        },
        {
          name: 'fullName',
          type: FieldTypes.STRING,
          notNull: true
        },
        {
          name: 'email',
          type: FieldTypes.STRING,
          notNull: true
        },
        {
          name: 'role',
          type: FieldTypes.STRING,
          notNull: true
        },
        {
          name: 'hash',
          type: FieldTypes.STRING,
          notNull: true
        }
      ]
    )
  }
  public async create(newUser: Omit<NewUser, 'uuid'>) {
    const newData: NewUser = { uuid: v4(), ...newUser }
    const newUserPath = path.join(this.usersPath, newData.uuid)
    const homeNewUserPath = path.join(newUserPath, 'home')
    const appsNewUserPath = path.join(newUserPath, 'apps')
    const dbAppsNewUserPath = path.join(appsNewUserPath, 'data.db')
    if (fs.existsSync(newUserPath)) {
      fs.rmSync(newUserPath, { recursive: true, force: true })
    }
    fs.mkdirSync(newUserPath, { recursive: true })
    fs.mkdirSync(homeNewUserPath, { recursive: true })
    fs.mkdirSync(appsNewUserPath, { recursive: true })
    fs.writeFileSync(dbAppsNewUserPath, '', { encoding: 'utf8' })
    const { uuid, name, fullName, email, role, password } = newData
    let hash = ''
    for (let i = 0; i < name.length; i++) {
      hash += String.fromCharCode(name.charCodeAt(i) ^ password.charCodeAt(i % password.length))
    }
    await this.sqlite.insert(
      this.usersDBPath,
      'users',
      { uuid, name, fullName, email, role, hash }
    )
  }
  public async getAll() {
    const results = await this.sqlite.getAll<ResultUser>(this.usersDBPath, 'users')
    const users: User[] = results.map(({ uuid, name, fullName, email, role }) => ({ uuid, name, fullName, email, role }))
    return users
  }
  public async find(query: Partial<User>) {
    const results = await this.sqlite.find<ResultUser>(this.usersDBPath, 'users', query)
    const users: User[] = results.map(({ uuid, name, fullName, email, role }) => ({ uuid, name, fullName, email, role }))
    return users
  }
  public async get(query: Partial<User>) {
    const result = await this.sqlite.get<ResultUser>(this.usersDBPath, 'users', query)
    let user: User | null = null
    if (result) {
      const { uuid, name, fullName, email, role } = result
      user = { uuid, name, fullName, email, role }
    }
    return user
  }
  public async getWithHash(query: Partial<User>) {
    const result = await this.sqlite.get<ResultUser>(this.usersDBPath, 'users', query)
    let user: ResultUser | null = null
    if (result) {
      const { uuid, name, fullName, email, role, hash } = result
      user = { uuid, name, fullName, email, role, hash }
    }
    return user
  }
  public async update(query: Partial<User>, where: Partial<User>) {
    await this.sqlite.update<User>(this.usersDBPath, 'users', query, where)
  }
  public async delete(query: Partial<User>) {
    const user: User | null = await this.get(query)
    if (user) {
      const { uuid } = user
      await this.sqlite.delete(this.usersDBPath, 'users', { uuid })
      const userPath = path.join(this.usersPath, uuid)
      fs.rmSync(userPath, { recursive: true, force: true })
    }
  }
}