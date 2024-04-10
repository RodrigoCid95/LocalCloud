import { verifySession } from './middlewares/session'
import { decryptRequest } from './middlewares/encrypt'
import { verifyPermissions } from './middlewares/permissions'
import { uploader } from './middlewares/uploader'

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const BeforeMiddleware: PXIOHTTP.BeforeMiddlewareDecorator
declare const METHODS: PXIOHTTP.METHODS

const { POST, PUT, DELETE } = METHODS

const formatPath = (req: PXIOHTTP.Request, _: PXIOHTTP.Response, next: PXIOHTTP.Next) => {
  let { path = '' } = req.body
  path = path.split('|').filter(item => item !== '')
  req.body = path
  next()
}

@Namespace('/api/fs', { before: [verifySession, decryptRequest, formatPath] })
export class FileSystemController {
  @Model('DevModeModel') public devModeModel: Models<'DevModeModel'>
  @Model('FileSystemModel') private fsModel: Models<'FileSystemModel'>
  @On(POST, '/shared/list')
  @BeforeMiddleware([verifyPermissions('ACCESS_SHARED_FILE_LIST'), decryptRequest])
  public sharedDrive(req: PXIOHTTP.Request, res: PXIOHTTP.Response) {
    const result = this.fsModel.lsSharedDirectory(req.body)
    if (typeof result === 'boolean') {
      res.status(404).json({
        code: 'not-found',
        message: 'La ruta que indicaste no existe.'
      })
      return
    }
    res.json(result)
  }
  @On(POST, '/user/list')
  @BeforeMiddleware([verifyPermissions('ACCESS_USER_FILE_LIST'), decryptRequest])
  public userDrive(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const result = this.fsModel.lsUserDirectory(req.session.user?.uuid || '', req.body)
    if (typeof result === 'boolean') {
      res.status(404).json({
        code: 'not-found',
        message: 'La ruta que indicaste no existe.'
      })
      return
    }
    res.json(result)
  }
  @On(POST, '/shared')
  @BeforeMiddleware([verifyPermissions('CREATE_SHARED_DIR'), decryptRequest])
  public mkdirSharedDrive(req: PXIOHTTP.Request, res: PXIOHTTP.Response) {
    this.fsModel.mkdirToShared(req.body)
    res.json(true)
  }
  @On(POST, '/user')
  @BeforeMiddleware([verifyPermissions('CREATE_USER_DIR'), decryptRequest])
  public mkdirUserDrive(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    this.fsModel.mkdirToUser(req.session.user?.uuid || '', req.body)
    res.json(true)
  }
  @On(PUT, '/shared')
  @BeforeMiddleware([verifyPermissions('UPLOAD_SHARED_FILE'), uploader])
  public uploadSharedDrive(req: PXIOHTTP.Request, res: PXIOHTTP.Response) {
    const { files } = req
    if (!files) {
      res.status(400).json({
        code: 'fields-required',
        message: 'Faltan campos!'
      })
      return
    }
    for (const { name, content } of files) {
      this.fsModel.writeToShared([...req.body, name], content)
    }
    res.json(true)
  }
  @On(PUT, '/user')
  @BeforeMiddleware([verifyPermissions('UPLOAD_USER_FILE'), uploader])
  public uploadUserDrive(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const { files } = req
    if (!files) {
      res.status(400).json({
        code: 'fields-required',
        message: 'Faltan campos!'
      })
      return
    }
    for (const { name, content } of files) {
      this.fsModel.writeToUser(req.session.user?.uuid || '', [...req.body, name], content)
    }
    res.json(true)
  }
  @On(DELETE, '/shared')
  @BeforeMiddleware([verifyPermissions('REMOVE_SHARED_FILES_AND_DIRECTORIES'), decryptRequest])
  public rmSharedDrive(req: PXIOHTTP.Request, res: PXIOHTTP.Response) {
    this.fsModel.rmToShared(req.body)
    res.json(true)
  }
  @On(DELETE, '/user')
  @BeforeMiddleware([verifyPermissions('REMOVE_USER_FILES_AND_DIRECTORIES'), decryptRequest])
  public rmUserDrive(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    this.fsModel.rmToUser(req.session.user?.uuid || '', req.body)
    res.json(true)
  }
}