import path from "node:path"
import fs from 'node:fs'
import mime from "mime-types"
import { session } from "./API/middlewares/session"
import { BaseAPI } from "./API/BaseAPI"
import { setPermission, PERMISSIONS } from "./API/middlewares/permissions"

@Namespace('file')
@Middlewares({ before: [session] })
export class FileController extends BaseAPI {
  @Model('UsersModel') public usersModel: Models<'UsersModel'>
  @Model('FileSystem') private fsModel: Models<'FileSystem'>

  private resolvePath(p: string[], user?: string): string {
    p = p.filter((s: string) => s !== '..' && s !== '')
    const base = p.shift()
    if (base === 'user' && user) {
      return path.join(this.fsModel.homeDir, user, ...p)
    }
    if (base === 'shared') {
      return path.join(this.fsModel.sharedDir, ...p)
    }
    return ''
  }

  @Before<FileController>([setPermission(PERMISSIONS.FS_DOWNLOAD), 'verifyPermission'])
  @Get('/*')
  public name(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    if (!req.params[0]) {
      res.status(400).json({ ok: false, code: 'missing-path', message: 'The path is required.' })
      return
    }
    const p = req.params[0].split('/')
    const rp = this.resolvePath(p, req.session.user?.name)
    if (!rp) {
      res.status(400).json({ ok: false, code: 'drive-invalid', message: 'The drive not found.' })
      return
    }
    const itemInfo = this.fsModel.getItem(rp)
    if (!itemInfo || !itemInfo.isFile) {
      res.status(404).json({ ok: false, code: 'file-not-found', message: 'File not found.' })
      return
    }
    const mimeType = mime.lookup(rp) || 'application/octet-stream'
    res.type(mimeType)
    const query = Object.keys(req.query)
    if (query.includes('download') && query['download'] === 'true') {
      res.setHeader('Content-Length', itemInfo.size)
      res.setHeader('Content-Disposition', `attachment; filename="${itemInfo.name}"`)
      const fileStream = fs.createReadStream(rp)
      fileStream.pipe(res)
    } else {
      res.sendFile(rp)
    }
  }
}