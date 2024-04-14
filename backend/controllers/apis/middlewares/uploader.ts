export const uploader: PXIOHTTP.Middleware = (req: PXIOHTTP.Request, res: PXIOHTTP.Response, next: PXIOHTTP.Next) => {
  const contentType = req.headers['content-type']
  const boundary = contentType?.split('=')[1]
  if (contentType && boundary) {
    let rawData = Buffer.from([])
    req.on('data', chunk => {
      rawData = Buffer.concat([rawData, chunk]);
    })
    req.on('end', () => {
      const strRawData = rawData.toString()
      const parts = strRawData.split(boundary)
      const files: Express.Request['files'] = []
      for (const part of parts) {
        if (part.includes('filename')) {
          const match = part.match(/filename="([^"]+)"/)
          const filename = match ? match[1] : 'file'
          const content = part.split('\r\n\r\n')[1].split('\r\n')[0]
          const encoder = new TextEncoder()
          const uint8Array = encoder.encode(content)
          const buffer = Buffer.from(uint8Array)
          files.push({
            name: filename,
            content: buffer
          })
        } else {
          const match = part.match(/name="([^"]+)"/)
          if (match) {
            const content = part.split('\r\n\r\n')[1].split('\r\n')[0]
            Object.defineProperty(req.body, match[1], { value: content })
          }
        }
      }
      req.files = files
      next()
    })
  } else {
    next()
  }
}