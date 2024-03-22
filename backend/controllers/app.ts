import { verifySession } from './middlewares/session'
import path from 'node:path'

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const METHODS: PXIOHTTP.METHODS

export const verifyApp = (req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: PXIOHTTP.Next) => {
  const { packagename } = req.params
  if (req.session?.apps && req.session?.apps[packagename]) {
    const app = req.session.apps[packagename]
    if (app) {
      const { font, img, connect, script } = app.secureSources
      res.setHeader('Content-Security-Policy', `frame-ancestors 'self';font-src ${font};img-src ${img};connect-src ${connect};script-src-elem ${script};`)
      next()
    } else {
      res.redirect('/')
    }
  } else {
    res.redirect('/')
  }
}

@Namespace('app', { before: [verifySession, verifyApp] })
export class AppController {
  @Model('AppsModel') private appsModel: Models<'AppsModel'>
  @On(METHODS.GET, '/:packagename')
  public app(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const app = (req.session as LocalCloud.SessionData).apps[req.params.packagename]
    res.render('app', { title: app.title, description: app.description, key: req.session.key, token: app.token })
  }
  @On(METHODS.GET, '/:packagename/*')
  public source(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const appPath = this.appsModel.paths.getAppPublic(req.params.packagename)
    const pathSource = path.join(appPath, ...req.params[0].split('/'))
    res.sendFile(pathSource, error => {
      if (error) {
        res.status(404).end()
      }
    })
  }
}