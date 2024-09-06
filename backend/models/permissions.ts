import type { Database } from 'sqlite3'

export class PermissionsModel {
  @Library('database') private database: Database
  public async find(query?: Partial<Permissions.Permission>): Promise<Permissions.Permission[]> {
    let strQuery = 'SELECT * FROM permissions'
    const values: any[] = []
    if (query) {
      const where: string[] = []
      const entries = Object.entries(query)
      for (const [key, value] of entries) {
        where.push(`${key} = ?`)
        values.push(value)
      }
      strQuery += ` WHERE ${where.join(' AND ')}`
    }
    const results = await new Promise<Permissions.Result[]>(resolve => this.database.all<Permissions.Result>(
      strQuery,
      values,
      (error, rows) => error ? resolve([]) : resolve(rows)
    ))
    return results.map(result => ({
      id: result.id_permission,
      package_name: result.package_name,
      api: result.api,
      justification: result.justification,
      active: result.active
    }))
  }
  public async setActive(id: number, active: boolean): Promise<void> {
    await new Promise(resolve => this.database.run(
      'UPDATE permissions set active = ? WHERE id_permission = ?',
      [active, id],
      resolve
    ))
  }
}