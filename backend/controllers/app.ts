import path from 'node:path'
import { devMode } from './middlewares/dev-mode'
import { verifySession } from './middlewares/session'

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const METHODS: PXIOHTTP.METHODS

export const verifyApp = (req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: PXIOHTTP.Next) => {
  const { packagename } = req.params
  if (req.session?.apps && req.session?.apps[packagename]) {
    const app = req.session.apps[packagename]
    if (app) {
      const font = app.secureSources.filter(item => item.type === 'font').join(' ')
      const img = app.secureSources.filter(item => item.type === 'img').join(' ')
      const connect = app.secureSources.filter(item => item.type === 'connect').join(' ')
      const script = app.secureSources.filter(item => item.type === 'script').join(' ')
      res.setHeader('Content-Security-Policy', `frame-ancestors 'self';font-src 'self'${font ? ` ${font}` : ''};img-src 'self'${img ? ` ${img}` : ''};connect-src 'self'${connect ? ` ${connect}` : ''};script-src-elem 'self'${script ? ` ${script}` : ''};`)
      next()
    } else {
      res.redirect('/')
    }
  } else {
    res.redirect('/')
  }
}

@Namespace('app', { before: [devMode, verifySession, verifyApp] })
export class AppController {
  @Model('DevModeModel') public devModeModel: Models<'DevModeModel'>
  @Model('AppsModel') private appsModel: Models<'AppsModel'>
  @On(METHODS.GET, '/:packagename')
  public app(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const app = (req.session as LocalCloud.SessionData).apps[req.params.packagename]
    res.render('app', { title: app.title, description: app.description, key: req.session.key, token: app.token })
  }
  @On(METHODS.GET, '/:packagename/connector.js')
  public connector(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const app = (req.session as LocalCloud.SessionData).apps[req.params.packagename]
    res.set('Content-Type', 'text/javascript');
    res.send(this.devModeModel.transformJS(app.token, req.session.key || ''))
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