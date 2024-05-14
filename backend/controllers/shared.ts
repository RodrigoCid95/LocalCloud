import { responseFile } from "./middlewares/file"

declare const Namespace: PXIOHTTP.NamespaceDecorator
declare const Model: PXIO.ModelDecorator
declare const On: PXIOHTTP.OnDecorator
declare const METHODS: PXIOHTTP.METHODS
declare const AfterMiddleware: PXIOHTTP.AfterMiddlewareDecorator

@Namespace('/shared')
export class SharedController {
  @Model('SharedModel') private sharedModel: Models<'SharedModel'>
  @Model('FileSystemModel') private fsModel: Models<'FileSystemModel'>
  @On(METHODS.GET, '/:id')
  @AfterMiddleware([responseFile])
  public async shared(req: PXIOHTTP.Request, res: PXIOHTTP.Response, next: PXIOHTTP.Next) {
    const { id } = req.params
    const [result] = await this.sharedModel.find({ id })
    if (result) {
      const { path, uid: uuid } = result
      const base = path.shift()
      let p: string | boolean = ''
      let file: boolean | FileSystem.ItemInfo | FileSystem.ItemInfo[]
      if (base === 'shared') {
        p = this.fsModel.resolveSharedFile(path)
        file = this.fsModel.resolveFileOrDirectory(p)
      } else {
        p = this.fsModel.resolveUserFile(uuid, path)
        file = this.fsModel.resolveFileOrDirectory(p)
      }
      req.body = { path: p, file }
      next()
    } else {
      res.status(404).end()
    }
  }
}