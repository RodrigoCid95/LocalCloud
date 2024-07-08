declare const flags: PXIO.Flags

export const devMode: DevMode.Config = {
  enable: flags.get('maintenance-mode'),
  user: flags.get('user')
}