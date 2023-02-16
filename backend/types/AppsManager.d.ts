export interface AppsManagerClass {
  install(uuid: string, packageName: string, data: Buffer): Promise<void>
  prepareUserDB(user: string): Promise<void>
}