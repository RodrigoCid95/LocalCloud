import type { UserDBResult, NewUser, User } from "interfaces/Users"
import type { DataBasesLib, RunResult } from "interfaces/DataBases"
import type { PathsLib } from "interfaces/Paths"
import type { Database } from "sqlite3"
import crypto from 'node:crypto'
import { Lib, Emitter } from "phoenix-js/core"
import { v4 } from 'uuid'

export class UsersModel {
  public onChange: Emitter
  @Lib('databases') private databases: DataBasesLib
  @Lib('paths') private paths: PathsLib
  private get systemDBRef(): Database {
    return this.databases.getConnector({})
  }
  constructor() {
    this.onChange = new Emitter()
  }
  private getPasswordHash(uuid: string, password: string) {
    return crypto.createHmac('sha1', uuid).update(password).digest('hex')
  }
  public async create({ userName, fullName, photo, email, phone, password }: NewUser): Promise<void> {
    const [user] = await this.find({ userName })
    if (user) {
      throw new Error(`El usuario ${userName} ya existe!`)
    }
    const uuid = v4()
    password = this.getPasswordHash(uuid, password)
    const { error: error2 } = await new Promise<RunResult>(resolve => this.systemDBRef.run(
      "INSERT INTO users ('uuid', 'user_name', 'full_name', 'password_hash', 'photo', 'email', 'phone') VALUES (?, ?, ?, ?, ?, ?, ?);",
      [uuid, userName, fullName, password, photo, email, phone],
      error => resolve({ error })
    ))
    if (error2) {
      throw error2
    }
    this.paths.createUserBaseStore(uuid)
    this.onChange.emmit()
  }
  public async find(query?: Partial<User>): Promise<User[]> {
    const { rows: userResults } = await new Promise(
      this.databases.getSelectQuery<UserDBResult, User>({
        db: this.systemDBRef,
        table: 'users',
        query,
        keys: { userName: 'user_name' }
      })
    )
    if (!userResults) {
      return []
    }
    return userResults.map(({ uuid, user_name, full_name, photo, email, phone }) => ({ uuid, userName: user_name, fullName: full_name || '', photo: photo || '', email: email || '', phone: phone || '' }))
  }
  public async update(uuid: string, query: Partial<Omit<User, 'uuid'>>): Promise<void> {
    const [user] = await this.find({ uuid })
    if (!user) {
      throw new Error(`El usuario con uuid "${uuid}" no existe!`)
    }
    await new Promise(this.databases.getUpdateQuery<Partial<Omit<User, 'uuid'>>, UserDBResult>({
      db: this.systemDBRef,
      table: "users",
      id: {
        key: "uuid",
        value: uuid
      },
      data: query,
      keys: {
        fullName: 'full_name'
      }
    }))
    this.onChange.emmit()
  }
  public async delete(uuid: string): Promise<void> {
    const [user] = await this.find({ uuid })
    if (!user) {
      throw new Error(`El usuario con uuid "${uuid}" no existe!`)
    }
    await new Promise(resolve => this.systemDBRef.run(
      "DELETE FROM 'users' WHERE uuid = ?",
      [uuid],
      resolve
    ))
    const userPath = this.paths.getUser(uuid)
    await this.databases.closeDBs(userPath)
    this.paths.removeUserBaseStore(uuid)
    this.onChange.emmit()
  }
  public async verifyPassword(uuid: string, password: string): Promise<boolean> {
    const { rows: [user] } = await new Promise(
      this.databases.getSelectQuery<UserDBResult, User>({
        db: this.systemDBRef,
        table: 'users',
        query: { uuid }
      })
    )
    const hash = this.getPasswordHash(uuid, password)
    return user.password_hash === hash
  }
}