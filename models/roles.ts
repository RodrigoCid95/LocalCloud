import type { DataBasesLib, RunResult } from 'interfaces/DataBases'
import type { NewRol, Rol, RolDBResult } from 'interfaces/Roles'
import type { Database } from "sqlite3"
import { Lib, Emitter } from 'phoenix-js/core'

export class RolesModel {
  public onChange: Emitter
  @Lib('databases') private databases: DataBasesLib
  private get systemDBRef(): Database {
    return this.databases.getConnector({})
  }
  constructor() {
    this.onChange = new Emitter()
  }
  public async create({ name, description, permissions }: NewRol): Promise<void> {
    const [rol] = await this.find({ name })
    if (rol) {
      throw new Error(`El rol ${name} ya existe!`)
    }
    const fields: string[] = ["'name'"]
    const values: string[] = [name || '']
    if (description) {
      fields.push("'description'")
      values.push(description)
    }
    if (permissions) {
      fields.push("'permissions'")
      values.push(permissions.join(','))
    }
    const { error } = await new Promise<RunResult>(resolve => this.systemDBRef.run(
      `INSERT INTO 'roles' (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`,
      values,
      error => resolve({ error })
    ))
    if (error) {
      throw error
    }
    this.onChange.emmit()
  }
  public async find(query?: Partial<Rol>): Promise<Rol[]> {
    const { error, rows } = await new Promise(
      this.databases.getQuery<RolDBResult, Rol>({
        db: this.systemDBRef,
        table: 'roles',
        query,
        keys: { id: 'id_rol' }
      })
    )
    if (error) {
      throw error
    }
    const result: Rol[] = []
    for (const { id_rol, name, description, permissions } of rows) {
      result.push({ id: id_rol, name, description, permissions: permissions.split(',') })
    }
    return result
  }
  public async update(id: number, query: Partial<Omit<Rol, 'id'>>): Promise<void> {
    const [rol] = await this.find({ id })
    if (!rol) {
      throw new Error(`El rol ${name} no existe!`)
    }
    const fields: string[] = []
    const values: string[] = []
    if (query.description) {
      fields.push("'description'")
      values.push(query.description)
    }
    if (query.permissions) {
      fields.push("'permissions'")
      values.push(query.permissions.join(','))
    }
    await new Promise(resolve => this.systemDBRef.run(
      `UPDATE 'roles' SET ${fields.join(', ')} WHERE id_rol = ?`,
      [...values, id],
      resolve
    ))
    this.onChange.emmit()
  }
  public async delete(id: number): Promise<void> {
    const [rol] = await this.find({ id })
    if (!rol) {
      throw new Error(`El rol ${name} no existe!`)
    }
    await new Promise(resolve => this.systemDBRef.run(
      "DELETE FROM 'users' WHERE id_rol = ?",
      [id],
      resolve
    ))
    this.onChange.emmit()
  }
  public async assignRolToUser({ id_rol, uuid }: AssignRolToUserArgs): Promise<void> {
    await new Promise<void>(resolve => this.systemDBRef.run(
      "INSERT INTO 'roles_users' (id_rol, uuid) VALUES (?, ?)",
      [id_rol, uuid],
      resolve
    ))
  }
  public async assignAppToRol({ id_rol, id_app }: AssignAppToRolArgs): Promise<void> {
    await new Promise<void>(resolve => this.systemDBRef.run(
      "INSERT INTO 'roles_apps' (id_rol, id_app) VALUES (?, ?)",
      [id_rol, id_app],
      resolve
    ))
  }
}
export interface AssignRolToUserArgs {
  id_rol: number
  uuid: string
}
export interface AssignAppToRolArgs {
  id_rol: number
  id_app: number
}