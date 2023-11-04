import { type Database } from "sqlite3"

export interface DataBasesConfigProfile {
  systemDB: string
  systemAppDB: string
}
export interface ConnectorArgs {
  /**
   * Si este argumento está vacío tomara la base de datos del sistema.
   */
  packageName?: string
  /**
   * Nombre de la base de datos.
   */
  name?: string
  /**
   * Queries que se lanzarán después de la creacion del archivo .db.
   */
  queries?: string[]
}
export interface GetConnectorArgs extends Omit<Partial<ConnectorArgs>, 'queries'> {
}
export interface GetQueryArgs<Q = any, R = any> {
  db: Database
  table: string
  query?: Partial<Q>
  keys?: {
    [Property in keyof Q]?: keyof R
  }
}
export interface DataBasesLib {
  /**
   * Devuelve un conector a una base de datos.
   */
  getConnector(args: GetConnectorArgs): Database
  /**
   * Crea un archivo .db.
   */
  createDB(args: ConnectorArgs): Promise<void>
  /**
   * Cierra las instancias abiertas de una base de datos basandose en una ruta del sistema de archivos usada como prefijo.
   */
  closeDBs(prefix: string): Promise<void>
  /**
   * Devuelve un callback para hacer una consulta sql.
   */
  getQuery<R = any, Q = any>(args: GetQueryArgs<Q, R>): CallbackResults<R>
}
export interface RunResult {
  error: Error | null
}
export interface DataResult<T = any> extends RunResult {
  rows: T
}
export interface DataResults<T = any> extends RunResult {
  rows: T[]
}
export type CallbackResult<T = any> = (resolve: (result: DataResult<T>) => void) => void
export type CallbackResults<T = any> = (resolve: (result: DataResults<T>) => void) => void