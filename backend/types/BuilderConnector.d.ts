declare global {
  namespace BuilderConnector {
    interface Config {
      mainPath: string
      apiPath: string
    }
    interface BuildOpts {
      token: string
      key: string
      apis?: string[]
    }
    interface Class {
      readonly privateAPIList: string[]
      readonly dashAPIList: string[]
      readonly publicAPIList: string[]
      build(opts: BuildOpts): string
    }
  }
}

export { }