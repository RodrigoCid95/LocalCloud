import fs from 'node:fs'

export const responseFile: PXIOHTTP.Middleware = (req: PXIOHTTP.Request, res: PXIOHTTP.Response): void => {
  const { path, file } = req.body
  if (typeof path === 'boolean' || !file) {
    res.status(404).json({
      code: 'not-found',
      message: 'La ruta que indicaste no existe.'
    })
    return
  }
  const query = Object.keys(req.query)
  if (req.headers['sec-fetch-dest'] === 'empty' || query.includes('download')) {
    let fileInfo: FileSystem.ItemInfo | undefined = undefined
    if (Array.isArray(file)) {
      fileInfo = file[0]
    }
    if (typeof file === 'object' && !Array.isArray(file)) {
      fileInfo = file
    }
    if (fileInfo) {
      res.setHeader('Content-Length', fileInfo.size)
      res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.name}"`)
    }
    const fileStream = fs.createReadStream(path)
    fileStream.pipe(res)
  } else {
    res.sendFile(path)
  }
}