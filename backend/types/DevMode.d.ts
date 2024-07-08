declare global {
  namespace DevMode {
    interface Config {
      enable?: boolean
      user?: string
    }
    interface Class {
      readonly enable: boolean
      readonly user: string
    }
  }
}

export { }