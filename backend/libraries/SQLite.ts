import { FieldDefinition, FieldTypes, SQLiteClass } from 'types/SQLite'
import { sqlite3, verbose } from 'sqlite3'
import fs from 'fs'
import path from 'path'

export default class SQLite implements SQLiteClass {
  private sqlite3: sqlite3
  constructor(private usersPath: string) {
    const dirs = fs.readdirSync(usersPath)
    for (const dir of dirs) {
      const appsDBPath = path.join(usersPath, dir, 'data.db')
      if (!fs.existsSync(appsDBPath)) {
        fs.writeFileSync(appsDBPath, '', { encoding: 'utf8' })
      }
    }
    this.sqlite3 = verbose()
  }
  public async createTable(user: string, nameTable: string, definitions: FieldDefinition[]): Promise<void> {
    const dbPath = path.join(this.usersPath, user, 'data.db')
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
      fields.push(`PRIMARY KEY("${pk}" AUTOINCREMENT)`)
    }
    const query = `CREATE TABLE IF NOT EXISTS "${nameTable}" (${fields.join(', ')});`
    await new Promise(resolve => db.run(query, resolve))
    await new Promise(resolve => db.close(resolve))
  }
}