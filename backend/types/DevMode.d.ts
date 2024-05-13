declare global {
  namespace DevMode {
    interface Config {
      enable: boolean
      user: string
    }
    interface Class {
      readonly config: Config
    }
  }
}

export { }