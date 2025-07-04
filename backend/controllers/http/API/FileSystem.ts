import path from 'node:path'
import fs from 'node:fs'
import busboy from 'busboy'
import { session } from './middlewares/session'
import { BaseAPI } from './BaseAPI'
import { PERMISSIONS, setPermission } from './middlewares/permissions'

@Namespace('api', 'fs')
@Middlewares({ before: [session] })
export class UserFileSystemController extends BaseAPI {
  @Model('UsersModel') public usersModel: Models<'UsersModel'>
  @Model('FileSystem') private fsModel: Models<'FileSystem'>

  private resolvePath(p: string[], user?: string) {
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

  public resolvePaths(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: Next): void {
    if (req.params[0]) {
      req.body.path = req.params[0].split('/')
    }
    if (!req.body.path) {
      res.status(400).json({ ok: false, code: 'missing-path', message: 'The path is required.' })
      return
    }
    if (!Array.isArray(req.body.path)) {
      res.status(400).json({ ok: false, message: 'The path has to be an array.' })
      return
    }
    const [base] = req.body.path
    if (!['user', 'shared'].includes(base)) {
      res.status(400).json({ ok: false, code: 'drive-invalid', message: 'The drive not found.' })
      return
    }
    req.body.resolvedPath = this.resolvePath(req.body.path, req.session.user?.name || '')
    next()
  }

  public emit(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    if (!res.closed) {
      res.json({ ok: true })
    }
    if (this.checkPermission(req, PERMISSIONS.FS_CHANGE)) {
      let event = req.body.path.join('/')
      event = `/${event}`
      io._nsps.get('/fs')?.to(req.session.id).emit(event)
    }
  }

  public async copyMoveFile(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { origin, dest } = req.body
    if ((!origin || !dest) && (!Array.isArray(origin) || !Array.isArray(dest))) {
      res.status(400).json({
        ok: false,
        code: 'fields-required',
        message: 'Faltan campos!'
      })
      return
    }
    const originResolved = this.resolvePath(origin, req.session.user?.name)
    const destResolved = this.resolvePath(dest, req.session.user?.name)
    if (!originResolved) {
      res.status(400).json({
        ok: false,
        code: 'origin-invalid',
        message: 'La ruta origen no es válida.'
      })
      return
    }
    if (!destResolved) {
      res.status(400).json({
        ok: false,
        code: 'detination-invalid',
        message: 'La ruta destino no es válida.'
      })
      return
    }
    await this.fsModel.copy(originResolved, destResolved)
    res.json({ ok: true })
    const emit = (p: string[]) => {
      if (this.checkPermission(req, PERMISSIONS.FS_CHANGE)) {
        let event = p.join('/')
        event = `/${event}`
        io._nsps.get('/fs')?.to(req.session.id).emit('change')
      }
    }
    emit(origin)
    emit(dest)
  }

  @Before<UserFileSystemController>([setPermission(PERMISSIONS.FS_LS), 'verifyPermission', 'resolvePaths'])
  @Get('/*')
  public async ls(req: PXIOHTTP.Request, res: PXIOHTTP.Response): Promise<void> {
    let items: FileSystem.ItemInfo[] = this.fsModel.ls(req.body.resolvedPath)
    if (!req.query.showHidden) {
      items = items.filter(item => !/^\./.test(item.name))
    }
    let containsFiles = true
    if (req.query.onlyDirs) {
      containsFiles = false
      items = items.filter(item => !item.isFile)
    }
    if (req.query.onlyFiles) {
      items = items.filter(item => item.isFile)
    }
    if (containsFiles && req.query.ext) {
      const exts = (req.query.ext as string).split(',')
      items = items.filter(item => {
        let pass = false
        if (item.isFile) {
          for (const ext of exts) {
            if (item.name.endsWith(`.${ext}`)) {
              pass = true
              break
            }
          }
        }
        return pass || (req.query.includeDirs && !item.isFile)
      })
    }
    res.json({ ok: true, items })
  }

  @Before<UserFileSystemController>([setPermission(PERMISSIONS.FS_MKDIR), 'verifyPermission', 'resolvePaths'])
  @After(['emit'])
  @Post('/mkdir')
  public async mkdir(req: PXIOHTTP.Request, _: PXIOHTTP.Response, next: Next): Promise<void> {
    await this.fsModel.mkdir(req.body.resolvedPath)
    next()
  }

  @Before<UserFileSystemController>([setPermission(PERMISSIONS.FS_RM), 'verifyPermission', 'resolvePaths'])
  @After(['emit'])
  @Delete('/rm')
  public rmFile(req: PXIOHTTP.Request, _: PXIOHTTP.Response, next: Next): void {
    this.fsModel.rm(req.body.resolvedPath)
    next()
  }

  @Before<UserFileSystemController>([setPermission(PERMISSIONS.FS_RENAME), 'verifyPermission', 'resolvePaths'])
  @After(['emit'])
  @Put('/rename')
  public async rename(req: PXIOHTTP.Request, res: PXIOHTTP.Response, next: Next): Promise<void> {
    const { new_name: newName, resolvedPath } = req.body
    if (!newName) {
      res.json({
        ok: false,
        code: 'missing-new-name',
        message: 'Se necesita un nombre nuevo.'
      })
      return
    }
    this.fsModel.rename(resolvedPath, newName)
    next()
  }

  @Before<UserFileSystemController>([setPermission(PERMISSIONS.FS_COPY), 'verifyPermission'])
  @After<UserFileSystemController>(['copyMoveFile'])
  @Post('/copy')
  public copy(_: PXIOHTTP.Request, __: PXIOHTTP.Response, next: Next) {
    next()
  }

  @Before<UserFileSystemController>([setPermission(PERMISSIONS.FS_MOVE), 'verifyPermission'])
  @After<UserFileSystemController>(['copyMoveFile'])
  @Post('/move')
  public move(_: PXIOHTTP.Request, __: PXIOHTTP.Response, next: Next) {
    next()
  }

  @Before<UserFileSystemController>([setPermission(PERMISSIONS.FS_UPLOAD), 'verifyPermission'])
  @After<UserFileSystemController>(['emit'])
  @Put('/upload')
  public async uploadFile(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: Next): Promise<void> {
    const contentType = req.header('content-type')
    if (contentType?.startsWith('multipart/form-data')) {
      const fields: Fields = {
        path: [],
        pathResolved: ''
      }
      const bb = busboy({ headers: req.headers })
      bb
        .on('field', (name, val) => {
          fields[name] = isJSON(val) ? JSON.parse(val) : val
        })
        .on('file', (_, file, info) => {
          if (!Array.isArray(fields.path)) {
            fields.path = fields.path.split('|')
          }
          const { filename } = info
          fields.pathResolved = this.resolvePath(fields.path, req.session.user?.name)
          const stream = this.fsModel.generateWriteStreamToFile(path.join(fields.pathResolved, filename))
          file
            .on('data', data => stream.write(data))
            .on('error', () => stream.close(() => fs.unlinkSync(stream.path)))
            .on('end', () => stream.close())
        })
        .on('finish', () => {
          req.body = { ...(req.body || {}), ...fields }
          next()
        })
      req.pipe(bb)
    } else {
      if (!res.closed) {
        res.status(400).json({ ok: false, message: 'Invalid content type' })
      }
    }
  }
}

interface Fields {
  path: string | string[]
  pathResolved: string
}