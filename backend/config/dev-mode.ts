import fs from 'node:fs'
import { paths } from './paths'

declare const flags: PXIO.Flags

let enable = false
let user = flags.get('user') as string
if (user) {
  enable = true
} else if (!fs.existsSync(paths.system.path)) {
  enable = true
}

export const devMode: DevMode.Config = { enable, user }