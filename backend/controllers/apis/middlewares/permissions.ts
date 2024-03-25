const DENIED_ERROR = {
  code: 'access-denied',
  message: 'No tienes permiso para hacer esto!'
}

export const verifyPermissions = ([api, part]: [string, number], freeForDashboard: boolean = false): PXIOHTTP.Middleware => (req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: PXIOHTTP.Next): void => {
  if (req.headers.referer === undefined) {
    res.status(403).json(DENIED_ERROR)
    return
  }
  if (req.headers.token === undefined) {
    res.status(403).json(DENIED_ERROR)
    return
  }
  const { referer, token } = req.headers
  const { href } = new URL(referer)
  const segments = href.split('/')
  const segment = segments[segments.length - 1]
  const isDashOrigin = segment === ''
  const tokenForVerify = isDashOrigin ? req.session.token : (req.session as LocalCloud.SessionData).apps[segment].token
  if (token !== tokenForVerify) {
    res.status(403).json(DENIED_ERROR)
    return
  }
  if (isDashOrigin) {
    if (!freeForDashboard) {
      res.status(403).json(DENIED_ERROR)
      return
    }
  } else {
    if (!(req.session as LocalCloud.SessionData).apps[segment].permissions[api].includes(part)) {
      res.status(403).json(DENIED_ERROR)
      return
    }
  }
  next()
}