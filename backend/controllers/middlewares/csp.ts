export const CSP: PXIOHTTP.Middleware = (_: PXIOHTTP.Request, res: PXIOHTTP.Response, next: Next) => {
  res.setHeader('Content-Security-Policy', `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src-elem 'self' 'unsafe-inline';`)
  next()
}