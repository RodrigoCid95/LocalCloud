declare const flags: PXIO.Flags

export const devMode: DevMode.Config = {
  user: flags.get('user')
}