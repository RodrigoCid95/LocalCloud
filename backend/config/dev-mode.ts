declare const flags: PXIO.Flags

let enable = false
let user = flags.get('user') as string
if (user) {
  enable = true
}

export const devMode: DevMode.Config = { enable, user }