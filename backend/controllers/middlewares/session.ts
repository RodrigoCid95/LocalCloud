export const verifySession: PXIOHTTP.Middleware = (req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: PXIOHTTP.Next): void => {
  if (req.session.user) {
    next()
  } else {
    res.redirect('/login')
  }
}
export const verifyNotSession: PXIOHTTP.Middleware = (req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: PXIOHTTP.Next): void => {
  if (!req.session.user) {
    next()
  } else {
    res.redirect('/')
  }
}