export const CSP: PXIOHTTP.Middleware = (_: PXIOHTTP.Request, res: PXIOHTTP.Response, next: PXIOHTTP.Next) => {
  res.setHeader('Content-Security-Policy', `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src-elem 'self' 'unsafe-inline';`)
  next()
}