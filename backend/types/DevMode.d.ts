declare global {
  namespace DevMode {
    interface Config {
      user?: string
    }
    interface Class {
      readonly enable: boolean
      readonly user: string
    }
  }
}

export { }