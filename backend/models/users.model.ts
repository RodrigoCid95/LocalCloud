import { NewUser, User, ResultUser } from "types/Users"
import { CipherClass } from "types/Cipher"
import { FieldTypes, SQLiteClass } from 'types/SQLite'
import { FileSystem } from "types/FileSystem"
import fs from 'fs'
import path from 'path'
import { Lib } from "bitis/core"
import { v4 } from 'uuid'

export class UsersModel {
  @Lib('sqlite') private sqlite: SQLiteClass
  @Lib('cipher') public cipher: CipherClass
  @Lib('fileSystem') private fileSystem: FileSystem
  private usersPath: string
  private systemDBPath: string
  constructor() {
    this.usersPath = path.join(this.fileSystem.baseDir, 'users')
    this.systemDBPath = path.join(this.fileSystem.baseDir, 'data.db')
    this.sqlite.createTable(
      this.systemDBPath,
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
    ).then(() => {
      this.sqlite.createTable(
        this.systemDBPath,
        'apps',
        [
          {
            name: 'packagename',
            type: FieldTypes.STRING,
            notNull: true,
            primaryKey: true
          },
          {
            name: 'title',
            type: FieldTypes.STRING,
            notNull: true
          },
          {
            name: 'description',
            type: FieldTypes.STRING
          },
          {
            name: 'author',
            type: FieldTypes.STRING
          },
          {
            name: 'icon',
            type: FieldTypes.STRING,
            notNull: true
          },
          {
            name: 'services',
            type: FieldTypes.STRING
          },
          {
            name: 'type',
            type: FieldTypes.STRING,
            notNull: true
          },
          {
            name: 'tag',
            type: FieldTypes.STRING,
            notNull: true,
            unique: true
          }
        ]
      )
    })
  }
  public async create(newUser: Omit<NewUser, 'uuid'>) {
    const newData: NewUser = { uuid: v4(), ...newUser }
    const newUserPath = path.join(this.usersPath, newData.uuid)
    const homeNewUserPath = path.join(newUserPath, 'home')
    const tempNewUserPath = path.join(newUserPath, 'temp')
    const appsNewUserPath = path.join(newUserPath, 'apps')
    if (fs.existsSync(newUserPath)) {
      fs.rmSync(newUserPath, { recursive: true, force: true })
    }
    fs.mkdirSync(newUserPath, { recursive: true })
    fs.mkdirSync(homeNewUserPath, { recursive: true })
    fs.mkdirSync(tempNewUserPath, { recursive: true })
    fs.mkdirSync(appsNewUserPath, { recursive: true })
    const { uuid, name, fullName, email, role, password } = newData
    let hash = ''
    for (let i = 0; i < name.length; i++) {
      hash += String.fromCharCode(name.charCodeAt(i) ^ password.charCodeAt(i % password.length))
    }
    await this.sqlite.insert(
      this.systemDBPath,
      'users',
      { uuid, name, fullName, email, role, hash }
    )
    const appsDBPath = path.join(newUserPath, 'data.db')
    fs.writeFileSync(appsDBPath, '', { encoding: 'utf8' })
    await this.sqlite.createTable(
      appsDBPath,
      'apps',
      [
        {
          name: 'packagename',
          type: FieldTypes.STRING,
          notNull: true,
          primaryKey: true
        },
        {
          name: 'title',
          type: FieldTypes.STRING,
          notNull: true
        },
        {
          name: 'description',
          type: FieldTypes.STRING
        },
        {
          name: 'author',
          type: FieldTypes.STRING
        },
        {
          name: 'icon',
          type: FieldTypes.STRING,
          notNull: true
        },
        {
          name: 'services',
          type: FieldTypes.STRING
        },
        {
          name: 'type',
          type: FieldTypes.STRING,
          notNull: true
        },
        {
          name: 'tag',
          type: FieldTypes.STRING,
          notNull: true
        },
        {
          name: 'appSystem',
          type: FieldTypes.BOOLEAN,
          notNull: true
        }
      ]
    )
  }
  public async getAll() {
    const results = await this.sqlite.getAll<ResultUser>(this.systemDBPath, 'users')
    const users: User[] = results.map(({ uuid, name, fullName, email, role }) => ({ uuid, name, fullName, email, role }))
    return users
  }
  public async find(query: Partial<User>) {
    const results = await this.sqlite.find<ResultUser>(this.systemDBPath, 'users', query)
    const users: User[] = results.map(({ uuid, name, fullName, email, role }) => ({ uuid, name, fullName, email, role }))
    return users
  }
  public async get(query: Partial<User>) {
    const result = await this.sqlite.get<ResultUser>(this.systemDBPath, 'users', query)
    let user: User | null = null
    if (result) {
      const { uuid, name, fullName, email, role } = result
      user = { uuid, name, fullName, email, role }
    }
    return user
  }
  public async getWithHash(query: Partial<User>) {
    const result = await this.sqlite.get<ResultUser>(this.systemDBPath, 'users', query)
    let user: ResultUser | null = null
    if (result) {
      const { uuid, name, fullName, email, role, hash } = result
      user = { uuid, name, fullName, email, role, hash }
    }
    return user
  }
  public async update(query: Partial<User>, where: Partial<User>) {
    await this.sqlite.update<User>(this.systemDBPath, 'users', query, where)
  }
  public async delete(query: Partial<User>) {
    const user: User | null = await this.get(query)
    if (user) {
      const { uuid } = user
      await this.sqlite.delete(this.systemDBPath, 'users', { uuid })
      const userPath = path.join(this.usersPath, uuid)
      fs.rmSync(userPath, { recursive: true, force: true })
    }
  }
}