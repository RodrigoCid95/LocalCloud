const DENIED_ERROR = {
  code: 'access-denied',
  message: 'No tienes permiso para hacer esto!'
}

export const verifyPermissions = (api: string, freeForDashboard: boolean = false): PXIOHTTP.Middleware => (req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: PXIOHTTP.Next): void => {
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
    const app = (req.session as LocalCloud.SessionData).apps[segment]
    if (!app) {
      res.status(403).json(DENIED_ERROR)
      return
    }
    const [permission] = app.permissions.filter(permission => permission.api === api)
    if (!permission?.active) {
      res.status(403).json(DENIED_ERROR)
      return
    }
  }
  next()
}