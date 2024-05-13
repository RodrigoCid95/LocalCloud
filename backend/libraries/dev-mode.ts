declare const configs: PXIO.Configs

class DevMode implements DevMode.Class {
  get config(): DevMode.Config {
    return configs.get('devMode')
  }
}

export const devMode = () => new DevMode()