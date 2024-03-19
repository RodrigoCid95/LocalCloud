import path from 'node:path'

export const database: Database.Config = {
  path: path.resolve(__dirname, '..', 'system.db')
}