export const verifySession: PXIOHTTP.Middleware = (req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: PXIOHTTP.Next): void => {
  if (req.session.user) {
    next()
  } else {
    if (req.originalUrl === '/') {
      res.redirect('/login')
    } else {
      res.redirect(`/login?dest=${req.originalUrl}`)
    }
  }
}
export const verifyNotSession: PXIOHTTP.Middleware = (req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: PXIOHTTP.Next): void => {
  if (!req.session.user) {
    next()
  } else {
    if (req.query.dest) {
      res.redirect(req.query.dest as string)
    } else {
      res.redirect('/')
    }
  }
}