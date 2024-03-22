const DENIED_ERROR = {
  code: 'access-denied',
  message: 'No tienes permiso para hacer esto!'
}

export const verifyPermissions = (freeForDashboard: boolean = false): PXIOHTTP.Middleware => (req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: PXIOHTTP.Next): void => {
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
  const tokenForVerify = segment === '' ? req.session.token : (req.session as LocalCloud.SessionData).apps[segment].token
  if (token !== tokenForVerify) {
    res.status(403).json(DENIED_ERROR)
    return
  }
  if (segment === '') {
    if (!freeForDashboard) {
      res.status(403).json(DENIED_ERROR)
      return
    }
  } else {
    const API_NAME = req.baseUrl.slice(1, -1)
    if (!(req.session as LocalCloud.SessionData).apps[segment].permissions.includes(API_NAME)) {
      res.status(403).json(DENIED_ERROR)
      return
    }
  }
  next()
}