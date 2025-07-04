import path from 'node:path'
import fs from 'node:fs'
import { buildSync } from 'esbuild'

export class Builder implements Builder.Adapter {
  private mainEntrypoint: string
  private apiList: Builder.Module
  private apiStrList: string[] = []
  private apiResolvedPaths: string[]
  public dashApiList: string[]
  public publicApiList: string[]

  constructor() {
    const connectorPath = path.resolve('/', 'usr', 'share', 'local-cloud', 'connector')
    const metaPath = path.join(connectorPath, 'meta')
    this.mainEntrypoint = path.resolve('/', 'usr', 'share', 'local-cloud', 'connector', 'code', 'main.js')
    this.apiList = this.readFile(path.join(metaPath, 'list.json'))
    this.apiStrList = this.parse(this.apiList)
    this.apiResolvedPaths = []
    const entries = Object.entries(this.apiList)
    for (const [module, apis] of entries) {
      for (const api of apis) {
        this.apiResolvedPaths.push(path.join(connectorPath, 'code', 'apis', module, `${api}.js`))
      }
    }
    this.dashApiList = this.parse(this.readFile(path.join(metaPath, 'dashboard.json')))
    this.publicApiList = this.parse(this.readFile(path.join(metaPath, 'public.json')))
  }

  private readFile(filePath: string): Builder.Module {
    if (!fs.existsSync(filePath)) {
      return {}
    }
    const content = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(content || '{}')
  }

  public parse(list: string[]): Builder.Module;
  public parse(list: Builder.Module): string[];
  public parse(list: string[] | Builder.Module): Builder.Module | string[] {
    if (Array.isArray(list)) {
      const result: Builder.Module = {}
      for (const item of list) {
        const [module, api] = item.split('.')
        if (!result[module]) {
          result[module] = []
        }
        if (api) {
          result[module].push(api)
        }
      }
      return result
    } else {
      const entries = Object.entries(list)
      const result = []
      for (const [module, apis] of entries) {
        if (!result[module]) {
          result[module] = []
        }
        for (const api of apis) {
          result[module].push(api)
        }
      }
      return result
    }
  }

  public build({ token = '', key = '', apis = this.apiStrList }: Builder.BuildOpts = {}): string {
    const apiListEntries = Object.entries(this.apiList)
    const define = {}
    for (const [module, apiList] of apiListEntries) {
      for (const api of apiList) {
        const key = `$${module}_${api}`
        const value = apis[module]?.includes(api) ? 'true' : 'false'
        define[key] = value
      }
    }
    const IS_DEV = token == '' && key == ''
    const content = buildSync({
      entryPoints: [this.mainEntrypoint],
      bundle: true,
      platform: 'browser',
      define: {
        TOKEN: `"${token}"`,
        KEY: `"${key}"`,
        IS_DEV: IS_DEV ? 'true' : 'false',
        ...define
      },
      minify: !IS_DEV,
      format: 'esm',
      write: false,
      inject: this.apiResolvedPaths,
      treeShaking: true,
      sourcemap: IS_DEV ? 'inline' : false
    })
    return content.outputFiles[0].text
  }
}