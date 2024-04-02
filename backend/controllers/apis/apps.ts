import type fileUpload from 'express-fileupload'
import { verifySession } from './middlewares/session'
import { verifyPermissions } from './middlewares/permissions'
import { decryptRequest } from './middlewares/encrypt'

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const BeforeMiddleware: PXIOHTTP.BeforeMiddlewareDecorator
declare const METHODS: PXIOHTTP.METHODS
const { GET, POST, DELETE } = METHODS

@Namespace('api/apps', { before: [verifySession, decryptRequest] })
export class AppsAPIController {
  @Model('DevModeModel') public devModeModel: Models<'DevModeModel'>
  @Model('AppsModel') private appsModel: Models<'AppsModel'>
  @On(GET, '/')
  @BeforeMiddleware([verifyPermissions('APP_LIST')])
  public async apps(_: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const results = await this.appsModel.getApps()
    res.json(results)
  }
  @On(POST, '/')
  @BeforeMiddleware([verifyPermissions('INSTALL_APP')])
  public async install(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const package_zip = req.files?.package_zip as fileUpload.UploadedFile | undefined
    if (package_zip) {
      let package_name: string[] | string = package_zip.name.split('.')
      package_name.pop()
      package_name = package_name.join('.')
      const result = await this.appsModel.getAppByPackageName(package_name)
      if (!result) {
        await this.appsModel.install(package_name, package_zip.data)
        res.json(true)
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
  @On(DELETE, '/')
  @BeforeMiddleware([verifyPermissions('UNINSTALL_APP')])
  public async unInstall(_: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    res.json(true)
  }
}