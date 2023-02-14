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

export interface SQLiteClass {
  createTable: (user: string, nameTable: string, definitions: FieldDefinition[]) => Promise<void>
}