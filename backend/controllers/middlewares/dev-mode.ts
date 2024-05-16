import { verifyDevMode } from "controllers/apis/middlewares/dev-mode"

export function devMode(req: PXIOHTTP.Request, res: PXIOHTTP.Response, next: PXIOHTTP.Next) {
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