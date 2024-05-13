import { buildSync } from 'esbuild'
import * as API_LIST from 'libraries/classes/APIList'

declare const configs: PXIO.Configs

const privateAPIList: string[] = []
const dashAPIList: string[] = []
const publicAPIList: string[] = []
const allAPIList: string[] = []

class Builder implements BuilderConnector.Class {
  get privateAPIList() {
    return privateAPIList
  }
  get dashAPIList() {
    return dashAPIList
  }
  get publicAPIList() {
    return publicAPIList
  }
  constructor() {
    const entries = Object.entries(API_LIST)
    for (const [_, value] of entries) {
      const subEntries = Object.entries(value)
      for (const [_, value2] of subEntries) {
        if (typeof value2 === 'object') {
          if (value2.freeForDashboard) {
            dashAPIList.push(value2.name)
            allAPIList.push(value2.name)
          }
          if (value2.public) {
            publicAPIList.push(value2.name)
            allAPIList.push(value2.name)
          }
        } else {
          privateAPIList.push(value2)
          allAPIList.push(value2)
        }
      }
    }
  }
  build({ token, key, apis }: BuilderConnector.BuildOpts): string {
    const modules = {}
    for (const api of allAPIList) {
      modules[`$${api}`] = apis ? apis.includes(api) ? 'true' : 'false' : 'true'
    }
    const content = buildSync({
      entryPoints: [configs.get('builderConnector').mainPath],
      bundle: true,
      platform: 'browser',
      define: {
        TOKEN: `"${token}"`,
        KEY: `"${key}"`,
        IS_DEV: !token || !key ? 'true' : 'false',
        ...modules
      },
      minify: Array.isArray(apis),
      format: 'esm',
      write: false,
      inject: [configs.get('builderConnector').apiPath],
      treeShaking: true,
      sourcemap: 'inline'
    })
    return content.outputFiles[0].text
  }
}

export const builder = () => new Builder()