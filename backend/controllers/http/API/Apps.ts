import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import busboy from "busboy"
import { session } from "./middlewares/session"
import { BaseAPI } from './BaseAPI'
import { PERMISSIONS, setPermission } from './middlewares/permissions'

@Namespace('api', 'apps')
@Middlewares({ before: [session] })
export class AppsController extends BaseAPI {
  @Model('AppsModel') private appsModel: Models<'AppsModel'>
  @Model('UsersModel') private usersModel: Models<'UsersModel'>

  @Before<BaseAPI>([setPermission(PERMISSIONS.APPS_LIST), 'verifyPermission'])
  @Get('/')
  public get(_: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    const results = this.appsModel.get()
    res.json({ ok: true, results })
  }

  @Before<BaseAPI>([setPermission(PERMISSIONS.APPS_LIST_BY_UID), 'verifyPermission'])
  @Get('/:uid')
  public getByUID(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    const results = this.appsModel.getByUid(Number(req.params.uid || '0'))
    res.json({ ok: true, results })
  }

  @Before<BaseAPI>([setPermission(PERMISSIONS.APPS_INSTALL), 'verifyPermission'])
  @Put('/')
  public install(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    const loads = {}
    const bb = busboy({ headers: req.headers })
    bb
      .on('file', (name, file, info) => {
        const { mimeType } = info
        const packageName = name.replace('.zip', '')
        if (['application/zip', 'application/x-zip-compressed'].includes(mimeType)) {
          const stream = fs.createWriteStream(path.join(this.appsModel.appsTempPath, crypto.randomUUID()))
          file
            .on('data', data => stream.write(data))
            .on('error', () => stream.close(() => fs.unlinkSync(stream.path)))
            .on('end', () => {
              loads[packageName] = stream.path
              stream.close()
            })
        } else {
          file
            .on('end', () => {
              loads[packageName] = false
            })
        }
      })
      .on('finish', async () => {
        const results = {}
        const entries = Object.entries<any>(loads)
        for (const [packageName, packagePath] of entries) {
          if (!packagePath) {
            results[packageName] = {
              ok: false,
              code: 'invalid-file',
              message: 'Archivo inválido.'
            }
          } else {
            const update = req.query.update === 'true'
            if (!update) {
              const possibleApp = this.appsModel
                .get()
                .filter(a => a.package_name === packageName)
              if (possibleApp.length > 0) {
                results[packageName] = {
                  ok: false,
                  code: 'app-already-installed',
                  message: 'La aplicación ya está instalada.'
                }
                continue
              }
            }
            const result = await this.appsModel.install(packageName, packagePath, update)
            if (result === true) {
              results[packageName] = { ok: true }
            } else {
              if (result === 'manifest-author-required') {
                results[packageName] = {
                  ok: false,
                  code: result,
                  message: `El paquete ${packageName}.zip no cuenta con un autor.`
                }
                continue
              }
              if (result === 'manifest-invalid') {
                results[packageName] = {
                  ok: false,
                  code: result,
                  message: `El paquete ${packageName}.zip no cuenta con un manifest válido.`
                }
                continue
              }
              if (result === 'manifest-not-exist') {
                results[packageName] = {
                  ok: false,
                  code: result,
                  message: `El paquete ${packageName}.zip no cuenta con un manifest.`
                }
                continue
              }
              if (result === 'manifest-title-required') {
                results[packageName] = {
                  ok: false,
                  code: result,
                  message: `El paquete ${packageName}.zip no cuenta con un título.`
                }
              }
            }
          }
          if (packagePath) {
            fs.unlinkSync(packagePath)
          }
        }
        res.json(results)
        if (this.checkPermission(req, PERMISSIONS.APPS_CHANGE)) {
          io._nsps.get('/apps')?.to(req.session.id).emit('change')
        }
      })
    req.pipe(bb)
  }

  @Before<BaseAPI>([setPermission(PERMISSIONS.APPS_UNINSTALL), 'verifyPermission'])
  @Delete('/:package_name')
  public async uninstall(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { package_name: packageName } = req.params
    this.appsModel.uninstall(packageName)
    const users = await this.usersModel.getAll()
    for (const user of users) {
      this.usersModel.assignApp(user.uid, packageName)
    }
    res.json({ ok: true })
    if (this.checkPermission(req, PERMISSIONS.APPS_CHANGE)) {
      io._nsps.get('/apps')?.to(req.session.id).emit('change')
    }
  }
}