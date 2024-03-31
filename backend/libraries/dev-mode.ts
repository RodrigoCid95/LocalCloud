declare const configs: PXIO.Configs

export const devMode = () => configs.get('devMode')