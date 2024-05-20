import { verifySession } from './middlewares/session'
import { responseFile } from './middlewares/file'
import { CSP } from './middlewares/csp'

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const AfterMiddleware: PXIOHTTP.AfterMiddlewareDecorator
declare const METHODS: PXIOHTTP.METHODS

const { GET } = METHODS

@Namespace('/file', { before: [verifySession, CSP] })
export class FileController {
  @Model('DevModeModel') public devModeModel: Models<'DevModeModel'>
  @Model('FileSystemModel') private fsModel: Models<'FileSystemModel'>
  @On(GET, '/shared/*')
  @AfterMiddleware([responseFile])
  public sharedFile(req: PXIOHTTP.Request, _: PXIOHTTP.Response, next: PXIOHTTP.Next): void {
    const path = this.fsModel.resolveSharedFile(req.params[0].split('/'))
    const file = this.fsModel.resolveFileOrDirectory(path)
    req.body = { path, file }
    next()
  }
  @On(GET, '/user/*')
  @AfterMiddleware([responseFile])
  public userFile(req: PXIOHTTP.Request<LocalCloud.SessionData>, _: PXIOHTTP.Response, next: PXIOHTTP.Next): void {
    const path = this.fsModel.resolveUserFile(req.session.user?.name || '', req.params[0].split('/'))
    const file = this.fsModel.resolveFileOrDirectory(path)
    req.body = { path, file }
    next()
  }
}