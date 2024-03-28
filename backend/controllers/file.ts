import { verifySession } from './middlewares/session'

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const AfterMiddleware: PXIOHTTP.AfterMiddlewareDecorator
declare const METHODS: PXIOHTTP.METHODS

const { GET } = METHODS

@Namespace('/file', { before: [verifySession] })
export class FileController {
  @Model('FileSystemModel') private fsModel: Models<'FileSystemModel'>
  public responseFile(req: PXIOHTTP.Request, res: PXIOHTTP.Response): void {
    const path = req.body
    if (typeof path === 'boolean') {
      res.status(404).json({
        code: 'not-found',
        message: 'La ruta que indicaste no existe.'
      })
      return
    }
    res.sendFile(path)
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