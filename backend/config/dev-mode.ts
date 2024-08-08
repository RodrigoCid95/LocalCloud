declare const flags: PXIO.Flags

export const devMode: DevMode.Config = {
  enable: flags.get('maintenance-mode') as boolean,
  user: flags.get('user') as string
}