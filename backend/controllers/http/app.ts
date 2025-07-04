import { session } from "./middlewares/session"

@Namespace('app')
@Middlewares<AppController>({ before: [session, 'verifyApp'] })
export class AppController {
  @Model('AppsModel') private appsModel: Models<'AppsModel'>
  @Model('SourcesModel') private sourcesModel: Models<'SourcesModel'>
  @Model('PermissionsModel') private permissionsModel: Models<'PermissionsModel'>

  public verifyApp(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: Next): void {
    const { package_name: packageName } = req.params
    if (req.session?.apps?.[packageName]) {
      const app = req.session.apps[packageName]
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
      const secureSources = app.secureSources.filter(item => item.enable)
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
      if (process.env.ROOT_MODE === 'true') {
        const app = this.appsModel.getByPackageName(packageName)
        if (app) {
          if (!req.session.apps) {
            req.session.apps = {}
          }
          const secureSources = this.sourcesModel.get(app.package_name)
          const permissions = this.permissionsModel
            .get(app.package_name)
            .filter(p => p.enable)
            .map(p => p.name)
          req.session.apps[packageName] = {
            title: app.title,
            description: app.description,
            author: app.author,
            extensions: app.extensions,
            token: crypto.randomUUID(),
            secureSources,
            permissions,
          }
          next()
          return
        }
      }
      res.redirect('/')
    }
  }

  @Get('/:package_name')
  public index(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const { package_name } = req.params
    const app = (req.session as LocalCloud.SessionData).apps[package_name]
    res.render(
      `apps/${package_name.replace(/\./g, '-')}`,
      {
        title: app.title,
        description: app.description,
        package_name
      }
    )
  }

  @Get('/:package_name/*')
  public source(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const pathSource = this.appsModel.resolveAsset(req.params.package_name, ...req.params[0].split('/'))
    res.sendFile(pathSource, error => {
      if (error) {
        res.status(404).end()
      }
    })
  }
}