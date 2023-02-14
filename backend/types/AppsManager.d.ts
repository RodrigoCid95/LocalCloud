export interface AppsManagerClass {
  install: (user: string, packageName: string, data: Buffer) => Promise<void>
}