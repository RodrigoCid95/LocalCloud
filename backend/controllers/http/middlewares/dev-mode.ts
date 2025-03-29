import { verifyDevMode } from "controllers/http/apis/middlewares/dev-mode"

export function devMode(req: PXIOHTTP.Request, res: PXIOHTTP.Response, next: Next) {
  const model = verifyDevMode.bind(this)()
  if (model) {
    if (req.path !== '/') {
      res.redirect('/')
    } else {
      next()
    }
  } else {
    next()
  }
}