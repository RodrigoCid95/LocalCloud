declare global {
  namespace Builder {
    interface BuildOpts {
      token?: string
      key?: string
      apis?: string[]
    }
    interface Adapter {
      dashApiList: string[]
      publicApiList: string[]
      parse(list: string[]): Module
      parse(list: Module): string[]
      build(opts?: BuildOpts): string
    }
    type Module = {
      [key: string]: string[]
    }
  }
}

export { }