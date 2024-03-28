import type fileUpload from "express-fileupload"
import { verifySession } from './middlewares/session'
import { decryptRequest } from './middlewares/encrypt'
import { verifyPermissions } from './middlewares/permissions'

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const BeforeMiddleware: PXIOHTTP.BeforeMiddlewareDecorator
declare const METHODS: PXIOHTTP.METHODS

const { POST, PUT, DELETE } = METHODS

const formatPath = (req: PXIOHTTP.Request, res: PXIOHTTP.Response, next: PXIOHTTP.Next) => {
  let { path = '' } = req.body
  path = path.split('|').filter(item => item !== '')
  if (path.length > 1) {
    req.body = path
    next()
  } else {
    res.status(400).json({
      code: 'fields-required',
      message: 'Faltan campos!'
    })
  }
}

@Namespace('/api/fs', { before: [verifySession, decryptRequest, formatPath] })
export class FileSystemController {
  @Model('FileSystemModel') private fsModel: Models<'FileSystemModel'>
  @On(POST, '/shared/list')
  @BeforeMiddleware([verifyPermissions('ACCESS_SHARED_FILE_LIST')])
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
  @BeforeMiddleware([verifyPermissions('ACCESS_USER_FILE_LIST')])
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
  @BeforeMiddleware([verifyPermissions('CREATE_SHARED_DIR')])
  public mkdirSharedDrive(req: PXIOHTTP.Request, res: PXIOHTTP.Response) {
    this.fsModel.mkdirToShared(req.body)
    res.json(true)
  }
  @On(POST, '/user')
  @BeforeMiddleware([verifyPermissions('CREATE_USER_DIR')])
  public mkdirUserDrive(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    this.fsModel.mkdirToUser(req.session.user?.uuid || '', req.body)
    res.json(true)
  }
  @On(PUT, '/shared')
  @BeforeMiddleware([verifyPermissions('UPLOAD_SHARED_FILE')])
  public uploadSharedDrive(req: PXIOHTTP.Request, res: PXIOHTTP.Response) {
    const { file } = req.files as fileUpload.FileArray
    if (!file) {
      res.status(400).json({
        code: 'fields-required',
        message: 'Faltan campos!'
      })
      return
    }
    const { name, data } = file as fileUpload.UploadedFile
    this.fsModel.writeToShared([...req.body, name], data)
    res.json(true)
  }
  @On(PUT, '/user')
  @BeforeMiddleware([verifyPermissions('UPLOAD_USER_FILE')])
  public uploadUserDrive(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    const { file } = req.files as fileUpload.FileArray
    if (!file) {
      res.status(400).json({
        code: 'fields-required',
        message: 'Faltan campos!'
      })
      return
    }
    const { name, data } = file as fileUpload.UploadedFile
    this.fsModel.writeToUser(req.session.user?.uuid || '', [...req.body, name], data)
    res.json(true)
  }
  @On(DELETE, '/shared')
  @BeforeMiddleware([verifyPermissions('REMOVE_SHARED_FILES_AND_DIRECTORIES')])
  public rmSharedDrive(req: PXIOHTTP.Request, res: PXIOHTTP.Response) {
    this.fsModel.rmToShared(req.body)
    res.json(true)
  }
  @On(DELETE, '/user')
  @BeforeMiddleware([verifyPermissions('REMOVE_USER_FILES_AND_DIRECTORIES')])
  public rmUserDrive(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response) {
    this.fsModel.rmToUser(req.session.user?.uuid || '', req.body)
    res.json(true)
  }
}