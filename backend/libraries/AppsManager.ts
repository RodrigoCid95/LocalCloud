import { AppsManagerClass } from 'types/AppsManager'
import { FieldTypes } from 'types/SQLite'
import fs from 'fs'
import path from 'path'
import SQLite from './SQLite'
import { v4 } from 'uuid'
import unzipper from 'unzipper'

export default class AppsManager implements AppsManagerClass {
  constructor(private usersPath: string, private sqlite: SQLite) { }
  public async init() {
    const dirs = fs.readdirSync(this.usersPath)
    for (const dir of dirs) {
      await this.prepareUserDB(dir)
    }
  }
  public async prepareUserDB(user: string) {
    const appsDBPath = path.join(this.usersPath, user, 'data.db')
    if (!fs.existsSync(appsDBPath)) {
      fs.writeFileSync(appsDBPath, '', { encoding: 'utf8' })
    }
    await this.sqlite.createTable(
      user,
      'apps',
      [
        {
          name: 'packagename',
          type: FieldTypes.STRING,
          notNull: true,
          primaryKey: true
        },
        {
          name: 'title',
          type: FieldTypes.STRING,
          notNull: true
        },
        {
          name: 'description',
          type: FieldTypes.STRING
        },
        {
          name: 'author',
          type: FieldTypes.STRING
        },
        {
          name: 'icon',
          type: FieldTypes.STRING,
          notNull: true
        },
        {
          name: 'services',
          type: FieldTypes.STRING
        },
        {
          name: 'type',
          type: FieldTypes.STRING,
          notNull: true
        },
        {
          name: 'tag',
          type: FieldTypes.STRING,
          notNull: true
        },
        {
          name: 'appSystem',
          type: FieldTypes.BOOLEAN,
          notNull: true
        }
      ]
    )
  }
  public async install(uuid: string, packageName: string, data: Buffer, isSystemApp: boolean = false): Promise<void> {
    const tempName = `${v4()}.zip`
    const tempPath = path.join(this.usersPath, uuid, 'temp', tempName)
    const appPath = path.join(this.usersPath, uuid, 'apps', packageName)
    const userDBPath = path.join(this.usersPath, uuid, 'data.db')
    const result = await this.sqlite.get(userDBPath, 'apps', { packageName })
    const revert = () => {
      if (fs.existsSync(tempPath)) {
        fs.rmSync(tempPath, { recursive: true, force: true })
      }
      if (fs.existsSync(appPath)) {
        fs.rmSync(appPath, { recursive: true, force: true })
      }
    }
    if (result === null) {
      try {
        fs.writeFileSync(tempPath, data)
        if (fs.existsSync(appPath)) {
          fs.rmSync(appPath, { recursive: true, force: true })
        }
        fs.mkdirSync(appPath, { recursive: true })
        await unzipper.Open.file(tempPath).then(d => d.extract({ path: appPath, concurrency: 5 }))
        fs.rmSync(tempPath, { recursive: true, force: true })
        const manifestPath = path.join(appPath, 'manifest.json')
        const manifestData = JSON.parse(fs.readFileSync(manifestPath, { encoding: 'utf8' }))
        fs.rmSync(manifestPath, { force: true })
        const { title, description, author, icon, services = {}, type, tag, appSystem } = manifestData
        if (!title || !icon || !type || !tag) {
          revert()
          throw new Error('Error de instalación')
        }
        await this.sqlite.insert(
          userDBPath,
          'apps',
          {
            packageName,
            title,
            description: description || '',
            author: author ? JSON.stringify(author) : '',
            icon,
            services: JSON.stringify(services),
            type,
            tag,
            appSystem: appSystem ? 1 : 0
          })
      } catch (error) {
        revert()
        throw new Error('Error de instalación')
      }
    } else {
      throw new Error(`La app ${packageName} ya está instalada!`)
    }
  }
}