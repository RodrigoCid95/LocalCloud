import { verifyDevMode } from "./dev-mode"

const REQUIRED_LOGIN = {
  code: 'required-login',
  message: 'Inicio de sesión requerido.'
}

export async function verifySession(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: PXIOHTTP.Next): Promise<void> {
  if (req.session.user) {
    next()
  } else {
    const model: Models<'DevModeModel'> | boolean = verifyDevMode.bind(this)()
    if (typeof model !== 'boolean') {
      req.session.user = model.user
      req.session.apps = await model.getApps()
      next()
      return
    }
    res.status(401).json(REQUIRED_LOGIN)
  }
}