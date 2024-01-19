import type { App } from 'interfaces/Apps'
import type { LocalCloud } from 'declarations'
import type { Next, Request, Response } from 'phoenix-js/http'
import type { AppsModel } from 'models'
import { Model } from 'phoenix-js/core'
import { Prefix, On, Methods, beforeMiddelware } from 'phoenix-js/http'
import { verifySession } from 'controllers/middlewares/session'
import { v4 } from 'uuid'

const { GET } = Methods

@Prefix('app')
export class AppController {
  @Model('AppsModel') private model: AppsModel
  public async loadApp(req: Request<LocalCloud.SessionData>, res: Response, next: Next): Promise<void> {
    let app: App | undefined
    if (!req.session.apps[req.params.packagename]) {
      app = (await this.model.find({ packageName: req.params.packagename || '' }))[0]
      if (app) {
        req.session.apps[req.params.packagename] = { ...app, token: v4() }
        next()
      } else {
        res.redirect('/')
      }
    } else {
      next()
    }
  }
  public setAppHeaders(req: Request<LocalCloud.SessionData>, res: Response, next: Next): void {
    const app = req.session.apps[req.params.packagename]
    const { font = "'self'", img = "'self'", connect = "'self'", script = "'self'" } = app.secureSources
    res.setHeader('Content-Security-Policy', `frame-ancestors 'self';font-src ${font};img-src ${img};connect-src ${connect};script-src-elem ${script};`)
    next()
  }
  @On(GET, '/:packagename')
  @beforeMiddelware([verifySession, 'loadApp', 'setAppHeaders'])
  public async index(req: Request<LocalCloud.SessionData>, res: Response): Promise<void> {
    const app = req.session.apps[req.params.packagename]
    res.render('app', { app, key: req.session.key, token: app.token })
  }
  @On(GET, '/:packagename/*')
  @beforeMiddelware([verifySession, 'loadApp', 'setAppHeaders'])
  public async asset(req: Request<LocalCloud.SessionData>, res: Response): Promise<void> {
    try {
      const assetPath = this.model.resolveAsset(req.params.packagename, ...req.params[0].split('/'))
      res.sendFile(assetPath)
    } catch (error) {
      res.status(404).render('404')
    }
  }
}