import fileUpload, { type UploadedFile } from 'express-fileupload'
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
  @Before([verifyPermission(APPS.INSTALL), fileUpload()])
  @Put('/')
  public async install(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const package_zip: UploadedFile | undefined = req.files?.package_zip as any
    const update = req.body.update !== undefined
    if (package_zip) {
      let package_name: string[] | string = package_zip.name.split('.')
      package_name.pop()
      package_name = package_name.join('.')
      const { appsModel } = (this as AppsAPIController)
      const result = await appsModel.getAppByPackageName(package_name)
      if (update && !result) {
        res.status(400).json({
          code: 'app-not-exist',
          message: `La aplicación ${package_name} no está instalada.`
        })
        return
      }
      if (!update && result) {
        res.status(400).json({
          code: 'app-already-exist',
          message: `La aplicación ${package_name} ya está instalada.`
        })
        return
      }
      const reslt = await this.appsModel.install(package_name, package_zip.data, update)
      res.json(reslt)
    } else {
      res.status(400).json({
        code: 'fields-required',
        message: 'No hay ningún archivo adjunto.'
      })
    }
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