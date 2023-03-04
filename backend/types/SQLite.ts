export enum FieldTypes {
  STRING = 'TEXT',
  NUMBER = 'INTEGER',
  BOOLEAN = 'Boolean'
}

export type FieldDefinition = {
  primaryKey?: boolean
  name: string
  type: FieldTypes
  notNull?: boolean
  autoIncrement?: boolean
  unique?: boolean
}

export interface ISQLite {
  createTable(dbPath: string, nameTable: string, definitions: FieldDefinition[]): Promise<void>
  insert(dbPath: string, nameTable: string, newData: { [x: string]: string | number | boolean | null }): Promise<void>
  getAll<T = {}>(dbPath: string, nameTable: string): Promise<T[]>
  find<T = {}>(dbPath: string, nameTable: string, query: Partial<T>): Promise<T[]>
  get<T = {}>(dbPath: string, nameTable: string, query: Partial<T>): Promise<T | null>
  update<T = {}>(dbPath: string, nameTable: string, query: Partial<T>, where: Partial<T>): Promise<void>
  delete<T = {}>(dbPath: string, nameTable: string, query: Partial<T>): Promise<void>
}