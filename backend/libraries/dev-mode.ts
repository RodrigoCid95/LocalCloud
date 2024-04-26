import path from 'node:path'

declare const configs: PXIO.Configs

class DevMode implements DevMode.Class {
  get config(): DevMode.Config {
    return configs.get('devMode')
  }
  resolve = (p: string[]) => path.join(this.config.connectorPath, ...p)
  
}

export const devMode = () => new DevMode()