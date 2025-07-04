import crypto from 'node:crypto'

const REQUIRED_LOGIN = {
  ok: false,
  code: 'required-login',
  message: 'Inicio de sesión requerido.'
}

export function session(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: Next): void {
  if (!req.session.key) {
    req.session.key = crypto.randomUUID()
  }
  if (!req.session.token) {
    req.session.token = crypto.randomUUID()
  }
  if (req.session.user) {
    next()
    return
  } else {
    if (process.env.ROOT_MODE === 'true') {
      req.session.user = {
        uid: 0,
        name: 'root',
        fullName: '',
        email: '',
        phone: ''
      }

      req.session.save(error => {
        if (error) {
          console.error(error)
        }
        next()
      })
      return
    }
  }
  res.status(403).json(REQUIRED_LOGIN)
}