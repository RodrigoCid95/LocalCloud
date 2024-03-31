declare global {
  namespace DevMode {
    interface Config {
      isDevMode: boolean
      uuid: string
      cors: string
      connectorPath: string
    }
  }
}

export { }