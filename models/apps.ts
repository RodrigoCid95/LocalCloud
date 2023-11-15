import type { App, NewApp, AppDBResult } from 'interfaces/Apps'
import type { DataBasesLib, RunResult } from 'interfaces/DataBases'
import type { PathsLib } from 'interfaces/Paths'
import type { Database } from 'sqlite3'
import { Lib } from 'phoenix-js/core'

export class AppsModel {
  @Lib('databases') private databases: DataBasesLib
  @Lib('paths') private paths: PathsLib
  private get systemDBRef(): Database {
    return this.databases.getConnector({})
  }
  public async create({ packageName, title, description, author = '', icon = '', dependences = [], secureSources = { font: "'self'", img: "'self'", connect: "'self'", script: "'self'" } }: NewApp, zip?: any): Promise<void> {
    const { font = "'self'", img = "'self' data:", connect = "'self'", script = "'self'" } = secureSources
    const [app] = await this.find({ packageName })
    if (app) {
      throw new Error(`El usuario ${packageName} ya existe!`)
    }
    const { error } = await new Promise<RunResult>(resolve => this.systemDBRef.run(
      "INSERT INTO 'apps' (package_name, title, description, author, icon, dependences, font, img, connect, script) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [packageName, title, description, author, icon, dependences.join(','), font, img, connect, script],
      error => resolve({ error })
    ))
    if (error) {
      throw error
    }
    this.paths.createSystemAppBaseStore(packageName || '')
  }
  public async find(query?: Partial<App>): Promise<App[]> {
    const { rows: appsResult } = await new Promise(
      this.databases.getSelectQuery<AppDBResult, App>({
        db: this.systemDBRef,
        table: 'apps',
        query,
        keys: { id: 'id_app', packageName: 'package_name' }
      })
    )
    return appsResult.map(({ id_app, package_name, title, description = '', author = '', icon = '', dependences = '', font, img, connect, script }) => ({ id: id_app, packageName: package_name, title, description, author, icon, dependences: dependences.split(','), secureSources: { font, img, connect, script } }))
  }
  public resolveAsset(packageName: string, ...paths: string[]): string {
    return this.paths.getSystemAppAsset(packageName, ...paths)
  }
}