import { Server, ServiceArguments, Manifest } from 'types'

const __props__ = Symbol()
export default class Service {
  [__props__] = {
    server: this.args.server,
    manifest: this.args.manifest
  }

  public get server(): Server {
    return this[__props__].server
  }

  public get manifest(): Manifest {
    return this[__props__].manifest
  }

  constructor(private args: ServiceArguments) { }
  onKill() { }
}