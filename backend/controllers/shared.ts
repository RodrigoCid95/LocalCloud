import { responseFile } from "./middlewares/file"

@Namespace('shared')
export class SharedController {
  @Model('SharedModel') private sharedModel: Models<'SharedModel'>
  @Model('FileSystemModel') private fsModel: Models<'FileSystemModel'>
  @After([responseFile])
  @Get('/:id')
  public async shared(req: PXIOHTTP.Request, res: PXIOHTTP.Response, next: Next) {
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