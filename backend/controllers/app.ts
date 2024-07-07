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
      const directives = {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src-elem': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:'],
        'font-src': ["'self'", 'data:']
      }
      const setDirective = (directive: string, value: string) => {
        if (!directives[directive]) {
          directives[directive] = ["'self'"]
        }
        if (!directives[directive].includes(value)) {
          directives[directive].push(value)
        }
      }
      const secureSources = app.secureSources.filter(item => item.active)
      for (const item of secureSources) {
        if (item.type === 'image') {
          setDirective('img-src', item.source)
          continue
        }
        if (item.type === 'media') {
          setDirective('media-src', item.source)
          continue
        }
        if (item.type === 'object') {
          setDirective('object-src', item.source)
          continue
        }
        if (item.type === 'script') {
          setDirective('script-src', item.source)
          continue
        }
        if (item.type === 'style') {
          setDirective('style-src', item.source)
          continue
        }
        if (item.type === 'worker') {
          setDirective('worker-src', item.source)
          continue
        }
        if (item.type === 'font') {
          setDirective('font-src', item.source)
          continue
        }
        if (item.type === 'connect') {
          setDirective('connect-src', item.source)
          continue
        }
      }
      res.setHeader(
        'Content-Security-Policy',
        Object.entries(directives)
          .map(([directive, value]) => `${directive} ${value.join(' ')}`)
          .join('; ')
      )
      next()
    } else {
      res.redirect('/')
    }
  } else {
    res.redirect('/')
  }
}

@Namespace('/app', { before: [devMode, verifySession, verifyApp] })
export class AppController {
  @Model('UsersModel') public usersModel: Models<'UsersModel'>
  @Model('DevModeModel') public devModeModel: Models<'DevModeModel'>
  @Model('AppsModel') private appsModel: Models<'AppsModel'>
  @On(METHODS.GET, '/:packagename')
  public app(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const app = (req.session as LocalCloud.SessionData).apps[req.params.packagename]
    if (app.useTemplate) {
      res.render(
        `apps/${req.params.packagename.replace(/\./g, '-')}`,
        {
          title: app.title,
          description: app.description,
          package_name: req.params.packagename
        }
      )
    } else {
      res.render(
        'app',
        {
          title: app.title,
          description: app.description,
          package_name: req.params.packagename
        }
      )
    }
  }
  @On(METHODS.GET, '/:packagename/*')
  public source(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const appPath = this.appsModel.paths.getApp(req.params.packagename)
    const pathSource = path.join(appPath, ...req.params[0].split('/'))
    res.sendFile(pathSource, error => {
      if (error) {
        res.status(404).end()
      }
    })
  }
}