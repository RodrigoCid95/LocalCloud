import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import busboy from 'busboy'
import { verifySession } from './middlewares/session'
import { verifyPermission } from './middlewares/permissions'
import { decryptRequest } from './middlewares/encrypt'
import { APPS } from 'libraries/classes/APIList'

@Namespace('api', 'apps')
@Middlewares({ before: [verifySession, decryptRequest] })
export class AppsAPIController {
  @Model('DevModeModel') public devModeModel: Models<'DevModeModel'>
  @Model('UsersModel') public usersModel: Models<'UsersModel'>
  @Model('AppsModel') public appsModel: Models<'AppsModel'>
  @Before([verifyPermission(APPS.APPS)])
  @Get('/')
  public async apps(_: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const results = await this.appsModel.getApps()
    res.json(results.map(({ package_name, title, description, author, extensions, useStorage }) => ({ package_name, title, description, author, extensions, useStorage })))
  }
  @Before([verifyPermission(APPS.APPS_BY_UID)])
  @Get('/:uid')
  public async appsByUID(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const user = this.usersModel.getUserByUID(Number(req.params.uid || 'NaN'))
    if (!user) {
      res.status(400).json({
        code: 'user-not-exist',
        message: 'El usuario no existe.'
      })
      return
    }
    const results = await this.appsModel.getAppsByUID(user.uid)
    res.json(results.map(({ package_name, title, description, author, extensions, useStorage }) => ({ package_name, title, description, author, extensions, useStorage })))
  }
  @Before([verifyPermission(APPS.INSTALL)])
  @Put('/')
  public install(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    const loads = {}
    const bb = busboy({ headers: req.headers })
    bb
      .on('file', (name, file, info) => {
        const { filename, mimeType } = info
        if (['application/zip', 'application/x-zip-compressed'].includes(mimeType)) {
          const stream = fs.createWriteStream(path.join(this.appsModel.paths.apps, 'temp', crypto.randomUUID()))
          file
            .on('data', data => stream.write(data))
            .on('error', () => stream.close(() => fs.unlinkSync(stream.path)))
            .on('end', () => {
              loads[name] = {
                path: stream.path,
                filename
              }
              stream.close()
            })
        } else {
          file
            .on('data', () => { })
            .on('error', () => { })
            .on('end', () => {
              loads[name] = {
                code: 'invalid-file',
                message: 'El archivo no es válido.'
              }
            })
        }
      })
      .on('finish', async () => {
        const results = {}
        const entries = Object.entries<any>(loads)
        for (const [key, value] of entries) {
          if (value.code) {
            results[key] = value
          } else {
            const update = req.query.update !== undefined
            if (!update) {
              const possibleApp = await this.appsModel.getAppByPackageName(key)
              if (possibleApp) {
                results[key] = {
                  code: 'app-already-installed',
                  message: 'La aplicación ya está instalada.'
                }
                continue
              }
            }
            const result = await this.appsModel.install(key, value.path, update)
            if (result === true) {
              results[key] = { ok: true }
            } else {
              if (result === 'manifest-author-required') {
                results[key] = {
                  code: result,
                  message: `El paquete ${value.filename} no cuenta con un autor.`
                }
              }
              if (result === 'manifest-invalid') {
                results[key] = {
                  code: result,
                  message: `El paquete ${value.filename} no cuenta con un manifest válido.`
                }
              }
              if (result === 'manifest-not-exist') {
                results[key] = {
                  code: result,
                  message: `El paquete ${value.filename} no cuenta con un manifest.`
                }
              }
              if (result === 'manifest-title-required') {
                results[key] = {
                  code: result,
                  message: `El paquete ${value.filename} no cuenta con un título.`
                }
              }
            }
          }
          if (value.path) {
            fs.unlinkSync(value.path)
          }
        }
        res.json(results)
      })
    req.pipe(bb)
  }
  @Before([verifyPermission(APPS.UNINSTALL)])
  @Delete('/:package_name')
  public async unInstall(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { package_name } = req.params
    const app = await this.appsModel.getAppByPackageName(package_name)
    if (app) {
      await this.appsModel.uninstall(package_name)
      res.json(true)
    }
  }
}