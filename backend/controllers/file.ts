import { verifySession } from './middlewares/session'
import { responseFile } from './middlewares/file'
import { CSP } from './middlewares/csp'

@Namespace('file')
@Middlewares({ before: [verifySession, CSP] })
export class FileController {
  @Model('DevModeModel') public devModeModel: Models<'DevModeModel'>
  @Model('FileSystemModel') private fsModel: Models<'FileSystemModel'>
  @After([responseFile])
  @Get('/shared/*')
  public sharedFile(req: PXIOHTTP.Request, _: PXIOHTTP.Response, next: Next): void {
    const path = this.fsModel.resolveSharedFile(req.params[0].split('/'))
    const file = this.fsModel.resolveFileOrDirectory(path)
    req.body = { path, file }
    next()
  }
  @After([responseFile])
  @Get('/user/*')
  public userFile(req: PXIOHTTP.Request<LocalCloud.SessionData>, _: PXIOHTTP.Response, next: Next): void {
    const path = this.fsModel.resolveUserFile(req.session.user?.name || '', req.params[0].split('/'))
    const file = this.fsModel.resolveFileOrDirectory(path)
    req.body = { path, file }
    next()
  }
}