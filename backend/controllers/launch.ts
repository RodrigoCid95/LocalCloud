import { verifySession } from './middlewares/session'

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const AfterMiddleware: PXIOHTTP.AfterMiddlewareDecorator
declare const METHODS: PXIOHTTP.METHODS

const { GET } = METHODS

@Namespace('/launch', { before: [verifySession] })
export class LaunchController {
  @Model('DevModeModel') public devModeModel: Models<'DevModeModel'>
  @Model('FileSystemModel') private fsModel: Models<'FileSystemModel'>
  public responseFile(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    const path = req.body
    if (typeof path === 'boolean') {
      res.status(404).json({
        code: 'not-found',
        message: 'La ruta que indicaste no existe.'
      })
      return
    }
    const { app: queryApp = '' } = req.query
    const segments = req.url.split('/').filter(segment => segment !== '')
    const name = segments[segments.length - 1]
    const nameSegments = name.split('.')
    const ext = nameSegments[nameSegments.length - 1]
    const { apps = {} } = req.session
    const keys = Object.keys(apps)
    const possibleApps: string[] = []
    for (const package_name of keys) {
      const app = apps[package_name]
      if (app.extensions.includes(ext) || package_name === queryApp) {
        possibleApps.push(package_name)
      }
    }
    if (possibleApps.length > 0) {
      res.redirect(`/app/${possibleApps[0]}?file=${req.url}`)
      return
    }
    res.redirect(`/file${req.url.split('?')[0]}`)
  }
  @On(GET, '/shared/*')
  @AfterMiddleware(['responseFile'])
  public sharedFile(req: PXIOHTTP.Request, _: PXIOHTTP.Response, next: PXIOHTTP.Next): void {
    req.body = this.fsModel.resolveSharedFile(req.params[0].split('/'))
    next()
  }
  @On(GET, '/user/*')
  @AfterMiddleware(['responseFile'])
  public userFile(req: PXIOHTTP.Request<LocalCloud.SessionData>, _: PXIOHTTP.Response, next: PXIOHTTP.Next): void {
    req.body = this.fsModel.resolveUserFile(req.session.user?.uuid || '', req.params[0].split('/'))
    next()
  }
}