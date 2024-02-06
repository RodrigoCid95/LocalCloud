import type { DataBasesLib, RunResult } from 'interfaces/DataBases'
import type { NewGroup, Group, GroupDBResult } from 'interfaces/Groups'
import type { Database } from "sqlite3"
import { Lib, Emitter } from 'phoenix-js/core'

export class GroupsModel {
  public onChange: Emitter
  @Lib('databases') private databases: DataBasesLib
  private get systemDBRef(): Database {
    return this.databases.getConnector({})
  }
  constructor() {
    this.onChange = new Emitter()
  }
  public async create({ name, description, permissions }: NewGroup): Promise<void> {
    const [group] = await this.find({ name })
    if (group) {
      throw new Error(`El group ${name} ya existe!`)
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
      `INSERT INTO 'groups' (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`,
      values,
      error => resolve({ error })
    ))
    if (error) {
      throw error
    }
    this.onChange.emmit()
  }
  public async find(query?: Partial<Group>): Promise<Group[]> {
    const { error, rows } = await new Promise(
      this.databases.getSelectQuery<GroupDBResult, Group>({
        db: this.systemDBRef,
        table: 'groups',
        query,
        keys: { id: 'id_group' }
      })
    )
    if (error) {
      throw error
    }
    const result: Group[] = []
    for (const { id_group, name, description, permissions } of rows) {
      result.push({ id: id_group, name, description, permissions: permissions.split(',') })
    }
    return result
  }
  public async update(id: number, query: Partial<Omit<Group, 'id'>>): Promise<void> {
    const [group] = await this.find({ id })
    if (!group) {
      throw new Error(`El group ${name} no existe!`)
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
      `UPDATE 'groups' SET ${fields.join(', ')} WHERE id_group = ?`,
      [...values, id],
      resolve
    ))
    this.onChange.emmit()
  }
  public async delete(id: number): Promise<void> {
    const [group] = await this.find({ id })
    if (!group) {
      throw new Error(`El group ${name} no existe!`)
    }
    await new Promise(resolve => this.systemDBRef.run(
      "DELETE FROM 'users' WHERE id_group = ?",
      [id],
      resolve
    ))
    this.onChange.emmit()
  }
  public async assignGroupToUser({ id_group, uuid }: AssignGroupToUserArgs): Promise<void> {
    await new Promise<void>(resolve => this.systemDBRef.run(
      "INSERT INTO 'groups_users' (id_group, uuid) VALUES (?, ?)",
      [id_group, uuid],
      resolve
    ))
  }
  public async assignAppToGroup({ id_group, id_app }: AssignAppToGroupArgs): Promise<void> {
    await new Promise<void>(resolve => this.systemDBRef.run(
      "INSERT INTO 'groups_apps' (id_group, id_app) VALUES (?, ?)",
      [id_group, id_app],
      resolve
    ))
  }
}
export interface AssignGroupToUserArgs {
  id_group: number
  uuid: string
}
export interface AssignAppToGroupArgs {
  id_group: number
  id_app: number
}