import { getOrigin } from './middlewares/permissions'

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const METHODS: PXIOHTTP.METHODS

@Namespace('/api')
export class APIController {
  @Model('DevModeModel') public devModeModel: Models<'DevModeModel'>
  @On(METHODS.GET, '/connector.js')
  public connector(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    res.set('Content-Type', 'text/javascript')
    let token = req.session.token || ''
    const key = req.session.key || ''
    if (this.devModeModel.devMode.config.isDevMode) {
      res.send(
        this.devModeModel.transformJS(
          token,
          key,
          [
            ...this.devModeModel.privateAPIList,
            ...this.devModeModel.publicAPIList,
            ...this.devModeModel.dashAPIList
          ]
        )
      )
      return
    }
    const { referer } = req.headers
    if (referer) {
      const origin = getOrigin(referer)
      if (typeof origin === 'string') {
        res.send(this.devModeModel.transformJS(token, key, this.devModeModel.publicAPIList))
      } else {
        if (origin === 0) {
          res.send(this.devModeModel.transformJS(token, key, this.devModeModel.publicAPIList))
        }
        if (origin === 1) {
          res.send(this.devModeModel.transformJS(token, key, this.devModeModel.dashAPIList))
        }
      }
    } else {
      res.status(404).end()
    }
  }
}

export * from './apps'
export * from './auth'
export * from './fs'
export * from './permissions'
export * from './profile'
export * from './recycle-bin'
export * from './shared'
export * from './sources'
export * from './users'