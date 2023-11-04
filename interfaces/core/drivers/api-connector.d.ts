export type Headers = {
  [x: string]: string
}
export type UploadArgs = {
  file: File
  progress?: (porcent: number) => void | Promise<void>
  error?: () => void | Promise<void>
}
export interface APIConnector<Entity = {}> {
  setHeaders(headers?: Headers): void
  create<T = Entity>(data: T): Promise<void>
  read<T = Entity>(query?: Partial<T>): Promise<T[]>
  update<T = Entity>(query: Partial<T>, data: Partial<T>): Promise<void>
  delete<T = Entity>(query: Partial<T>): Promise<void>
  upload(uploadArgs: UploadArgs): void
}
export interface APIConnectorConstructable<Entity = {}> {
  new(opts: CreateAPIConnectorOpts): APIConnector<Entity>
}
export type CreateAPIConnectorOpts = {
  path: string[]
  host?: string
}