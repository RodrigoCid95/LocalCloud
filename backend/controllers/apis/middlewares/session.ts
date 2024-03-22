const REQUIRED_LOGIN = {
  code: 'required-login',
  message: 'Inicio de sesión requerido.'
}

export const verifySession: PXIOHTTP.Middleware = (req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: PXIOHTTP.Next): void => {
  if (req.session.user) {
    next()
  } else {
    res.status(401).json(REQUIRED_LOGIN)
  }
}