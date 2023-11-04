import type { sqlite3, Database } from 'sqlite3'
import type { CallbackResults, ConnectorArgs, DataBasesConfigProfile, DataBasesLib, GetConnectorArgs, GetQueryArgs } from 'interfaces/DataBases'
import fs from 'node:fs'
import path from 'node:path'
import { InitLibrary } from "phoenix-js/core"
import { verbose } from 'sqlite3'

const sqlite3: sqlite3 = verbose()

class DataBases implements DataBasesLib {
  private instancesDB: Map<string, Database>
  constructor(private args: DataBasesConfigProfile) {
    this.instancesDB = new Map()
  }
  private getDBPath({ packageName, name = 'data' }: Partial<ConnectorArgs>): string {
    if (!packageName) {
      return this.args.systemDB
    }
    return this.args.systemAppDB.replace(/:packagename/, packageName).replace(/:name/, name)
  }
  private getInstance(dbPath: string): Database {
    if (!this.instancesDB.has(dbPath)) {
      if (!fs.existsSync(dbPath)) {
        throw new Error(`La base de datos ${dbPath} no existe!`)
      }
      const instance = new sqlite3.Database(dbPath)
      instance.on('close', () => this.instancesDB.delete(dbPath))
      this.instancesDB.set(dbPath, instance)
    }
    return this.instancesDB.get(dbPath) as Database
  }
  public getConnector(args: GetConnectorArgs): Database {
    const dbPath = this.getDBPath(args)
    return this.getInstance(dbPath)
  }
  public async createDB(args: ConnectorArgs): Promise<void> {
    const dbPath = this.getDBPath(args)
    if (fs.existsSync(dbPath)) {
      throw new Error(`La base de datos ${dbPath} ya existe!`)
    }
    const dbBasePath = path.dirname(dbPath)
    if (!fs.existsSync(dbBasePath)) {
      fs.mkdirSync(dbBasePath, { recursive: true })
    }
    fs.writeFileSync(dbPath, '', { encoding: 'utf8' })
    if (args.queries) {
      const instance = this.getInstance(dbPath)
      for (const query of args.queries) {
        try {
          await new Promise<void>(
            (resolve, reject) =>
              instance.run(query, (error) => {
                if (error) {
                  reject(error)
                } else {
                  resolve()
                }
              })
          )
        } catch (error) {
          await new Promise(resolve => instance.close(resolve))
          fs.rmSync(dbPath)
          throw new Error(error)
        }
      }
    }
  }
  public async closeDBs(prefix: string): Promise<void> {
    const keys = this.instancesDB.keys()
    for (const key of keys) {
      const [segment] = key.split(prefix)
      if (segment === '') {
        await new Promise(resolve => (this.instancesDB.get(key) as Database).close(resolve))
      }
    }
  }
  public getQuery<R = any, Q = any>(args: GetQueryArgs<Q, R>): CallbackResults<R> {
    if (args.query) {
      const fields: string[] = []
      const values: any[] = []
      const keys = Object.keys(args.query)
      const ks = args.keys || {}
      for (const key of keys) {
        fields.push(ks[key] || key)
        values.push(args.query[key])
      }
      return resolve => args.db.all<R>(
        `SELECT * FROM '${args.table}' WHERE ${fields.map(f => `${f} = ?`).join(' OR ')}`,
        values,
        (error, rows) => resolve({ error, rows })
      )
    } else {
      return resolve => args.db.all<R>(
        `SELECT * FROM '${args.table}'`,
        [],
        (error, rows) => resolve({ error, rows })
      )
    }
  }
}

export const databases: InitLibrary<DataBasesConfigProfile, DataBasesLib> = async profile => new DataBases(profile)