declare global {
  namespace DevMode {
    interface Config {
      isDevMode: boolean
      uuid: string
      cors: string
    }
    interface Class {
      readonly config: Config
    }
  }
}

export { }