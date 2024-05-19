import { getOrigin } from './middlewares/permissions'

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const METHODS: PXIOHTTP.METHODS

@Namespace('/api')
export class APIController {
  @Model('DevModeModel') public devModeModel: Models<'DevModeModel'>
  @Model('BuilderModel') public builderModel: Models<'BuilderModel'>
  @On(METHODS.GET, '/connector.js')
  public connector(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    res.set('Content-Type', 'text/javascript')
    if (this.devModeModel.devMode.config.enable) {
      res.send(this.builderModel.build())
      return
    }
    let token = req.session.token || ''
    const key = req.session.key || ''
    const { referer } = req.headers
    if (referer) {
      const origin = getOrigin(referer)
      if (typeof origin === 'string' && req.session.apps) {
        const apis = req.session.apps[origin].permissions
          .filter(permission => permission.active)
          .map(permission => permission.api)
        if (req.session.apps[origin].useStorage) {
          apis.push('STORAGE')
        }
        res.send(this.builderModel.build({ token, key, apis }))
      } else {
        if (origin === 0) {
          res.send(this.builderModel.build({token, key, apis: this.builderModel.publicAPIList}))
        }
        if (origin === 1) {
          res.send(this.builderModel.build({token, key, apis: this.builderModel.dashAPIList}))
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
export * from './storages'
export * from './users'