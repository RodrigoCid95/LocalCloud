import path from 'node:path'

const srcPath = path.resolve(process.cwd(), 'connector')

export const builderConnector: BuilderConnector.Config = {
  mainPath: path.join(srcPath, 'main.ts'),
  apiPath: path.join(srcPath, 'apis.ts')
}