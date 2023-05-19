import { FieldDefinition, FieldTypes, ISQLite } from 'types/SQLite'
import { sqlite3, verbose } from 'sqlite3'

export default class SQLite implements ISQLite {
  private sqlite3: sqlite3
  constructor() {
    this.sqlite3 = verbose()
  }
  public async createTable(dbPath: string, nameTable: string, definitions: FieldDefinition[]): Promise<void> {
    const db = new this.sqlite3.Database(dbPath)
    const fields: string[] = []
    let pk = ''
    for (const { primaryKey, name, type, notNull, autoIncrement, unique } of definitions) {
      const field = [`"${name}"`]
      if (primaryKey) {
        pk = name
      }
      if (type) {
        field.push(type)
      } else {
        field.push('TEXT')
      }
      if (notNull) {
        field.push('NOT NULL')
      }
      if (type === FieldTypes.NUMBER && autoIncrement) {
        field.push('AUTOINCREMENT')
      }
      if (unique) {
        field.push('UNIQUE')
      }
      fields.push(field.join(' '))
    }
    if (pk) {
      fields.push(`PRIMARY KEY("${pk}")`)
    }
    const query = `CREATE TABLE IF NOT EXISTS "${nameTable}" (${fields.join(', ')});`
    await new Promise(resolve => db.run(query, resolve))
    await new Promise(resolve => db.close(resolve))
  }
  public async insert(dbPath: string, nameTable: string, newData: { [x: string]: string | number | boolean | null }): Promise<void> {
    const db = new this.sqlite3.Database(dbPath)
    const keys = Object.keys(newData)
    const sql = `INSERT INTO "${nameTable}" (${keys.join(', ')}) values (${keys.map(() => '?').join(', ')})`
    const values = keys.map(key => newData[key])
    const res = await new Promise(resolve =>
      db.run(sql, values, resolve)
    )
    console.log(res)
    await new Promise(resolve => db.close(resolve))
  }
  public async getAll<T = {}>(dbPath: string, nameTable: string): Promise<T[]> {
    const db = new this.sqlite3.Database(dbPath)
    const rows: T[] = await new Promise(resolve =>
      db.all<T>(
        `SELECT * from "${nameTable}"`,
        (_, rows) =>
          resolve(rows || [])
      )
    )
    await new Promise(resolve => db.close(resolve))
    return rows
  }
  public async find<T = {}>(dbPath: string, nameTable: string, query: Partial<T>): Promise<T[]> {
    const keys = Object.keys(query)
    if (keys.length === 0) {
      return []
    }
    const db = new this.sqlite3.Database(dbPath)
    const where = keys.map(key => `"${key}" = ?`)
    const sql = `SELECT * FROM "${nameTable}" WHERE ${where.join(', ')}`
    const values = keys.map(key => query[key])
    const result = await new Promise<T[]>(resolve =>
      db.all<T>(
        sql,
        values,
        (_, rows) => resolve(rows || [])
      )
    )
    await new Promise(resolve => db.close(resolve))
    return result
  }
  public async get<T = {}>(dbPath: string, nameTable: string, query: Partial<T>): Promise<T | null> {
    const keys = Object.keys(query)
    if (keys.length === 0) {
      return null
    }
    const db = new this.sqlite3.Database(dbPath)
    const where = keys.map(key => `"${key}" = ?`)
    const sql = `SELECT * FROM "${nameTable}" WHERE ${where.join(', ')}`
    const values = keys.map(key => query[key])
    const result = await new Promise<T | null>(resolve =>
      db.get<T>(
        sql,
        values,
        (_, rows) => resolve(rows || null)
      )
    )
    await new Promise(resolve => db.close(resolve))
    return result
  }
  public async update<T = {}>(dbPath: string, nameTable: string, query: Partial<T>, where: Partial<T>): Promise<void> {
    const queryKeys: string[] = Object.keys(query)
    const whereKeys: string[] = Object.keys(where)
    if (queryKeys.length === 0 || whereKeys.length === 0) {
      return
    }
    const db = new this.sqlite3.Database(dbPath)
    const setters = queryKeys.map(key => `"${key}" = ?`)
    const conditions = whereKeys.map(key => `"${key}" = ?`)
    const queryValues = queryKeys.map(key => query[key])
    const whereValues = whereKeys.map(key => where[key])
    const values = [...queryValues, ...whereValues]
    const sql = `UPDATE "${nameTable}" set ${setters.join(', ')} WHERE ${conditions.join(', ')}`
    await new Promise(resolve =>
      db.run(
        sql,
        values,
        resolve
      )
    )
    await new Promise(resolve => db.close(resolve))
  }
  public async delete<T = {}>(dbPath: string, nameTable: string, query: Partial<T>): Promise<void> {
    const queryKeys = Object.keys(query)
    if (queryKeys.length === 0) {
      return
    }
    const db = new this.sqlite3.Database(dbPath)
    const where = queryKeys.map(key => `"${key}" = ?`)
    const values = queryKeys.map(key => query[key])
    const sql = `DELETE FROM "${nameTable}" WHERE ${where.join(', ')}`
    await new Promise(resolve =>
      db.run(
        sql,
        values,
        resolve
      )
    )
    await new Promise(resolve => db.close(resolve))
  }
}