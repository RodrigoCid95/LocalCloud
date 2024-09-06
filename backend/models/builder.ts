export class BuilderModel {
  get privateAPIList() {
    return this.builder.privateAPIList
  }
  get dashAPIList() {
    return this.builder.dashAPIList
  }
  get publicAPIList() {
    return this.builder.publicAPIList
  }
  @Library('builder') private builder: BuilderConnector.Class
  build(opts?: BuildOptions): string {
    if (opts) {
      return this.builder.build(opts)
    }
    return this.builder.build({ token: '', key: '' })
  }
}

interface BuildOptions {
  token: string
  key: string
  apis: string[]
}