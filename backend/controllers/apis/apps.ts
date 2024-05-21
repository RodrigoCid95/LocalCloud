import fileUpload, { type UploadedFile } from 'express-fileupload'
import { verifySession } from './middlewares/session'
import { verifyPermission } from './middlewares/permissions'
import { decryptRequest } from './middlewares/encrypt'
import { APPS } from 'libraries/classes/APIList'

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const BeforeMiddleware: PXIOHTTP.BeforeMiddlewareDecorator
declare const METHODS: PXIOHTTP.METHODS
const { GET, PUT, DELETE } = METHODS

@Namespace('api/apps', { before: [verifySession, decryptRequest] })
export class AppsAPIController {
  @Model('DevModeModel') public devModeModel: Models<'DevModeModel'>
  @Model('UsersModel') public usersModel: Models<'UsersModel'>
  @Model('AppsModel') private appsModel: Models<'AppsModel'>
  @On(GET, '/')
  @BeforeMiddleware([verifyPermission(APPS.APPS)])
  public async apps(_: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const results = await this.appsModel.getApps()
    res.json(results.map(({ package_name, title, description, author, extensions, useStorage }) => ({ package_name, title, description, author, extensions, useStorage })))
  }
  @On(GET, '/:uid')
  @BeforeMiddleware([verifyPermission(APPS.APPS_BY_UID)])
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
  @On(PUT, '/')
  @BeforeMiddleware([verifyPermission(APPS.INSTALL), fileUpload()])
  public async install(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const package_zip: UploadedFile | undefined = req.files?.package_zip as any
    if (package_zip) {
      let package_name: string[] | string = package_zip.name.split('.')
      package_name.pop()
      package_name = package_name.join('.')
      const result = await this.appsModel.getAppByPackageName(package_name)
      if (!result) {
        const result = await this.appsModel.install(package_name, package_zip.data)
        res.json(result)
      } else {
        res.status(400).json({
          code: 'app-already-exist',
          message: `La aplicación ${package_name} ya está instalada.`
        })
      }
    } else {
      res.status(400).json({
        code: 'fields-required',
        message: 'No hay ningún archivo adjunto.'
      })
    }
  }
  @On(DELETE, '/:package_name')
  @BeforeMiddleware([verifyPermission(APPS.UNINSTALL)])
  public async unInstall(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { package_name } = req.params
    const app = await this.appsModel.getAppByPackageName(package_name)
    if (app) {
      await this.appsModel.uninstall(package_name)
      res.json(true)
    }
  }
}