declare global {
  namespace DevMode {
    interface Config {
      isDevMode: boolean
      uuid: string
      cors: string
      connectorPath: string
    }
    interface Class {
      readonly config: Config
      resolve(path: string[]): string
    }
  }
}

export { }