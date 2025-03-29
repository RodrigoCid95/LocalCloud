import { verifyDevMode } from "./dev-mode"

const REQUIRED_LOGIN = {
  code: 'required-login',
  message: 'Inicio de sesión requerido.'
}

export async function verifySession(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: Next): Promise<void> {
  if (req.session.user) {
    next()
  } else {
    const model: Models<'DevModeModel'> | boolean = verifyDevMode.bind(this)()
    if (typeof model !== 'boolean') {
      req.session.user = model.getUser()
      req.session.apps = await model.getApps(req.session.user?.uid || NaN)
      next()
      return
    }
    res.status(401).json(REQUIRED_LOGIN)
  }
}