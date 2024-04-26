import path from 'node:path'

declare const flags: PXIO.Flags

let isDevMode = flags.get('dev-mode') !== undefined
let uuid = ''
let cors = ''
if (isDevMode) {
  uuid = flags.get('uuid') as string
  cors = flags.get('cors') as string
  if (!uuid || !cors) {
    isDevMode = false
  }
}

export const devMode: DevMode.Config = {
  isDevMode,
  uuid,
  cors,
  connectorPath: path.join(process.cwd(), 'connector')
}