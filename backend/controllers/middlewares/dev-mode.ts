import { verifyDevMode } from "controllers/apis/middlewares/dev-mode"

export function devMode(_: PXIOHTTP.Request, res: PXIOHTTP.Response, next: PXIOHTTP.Next) {
  const model = verifyDevMode.bind(this)()
  if (model) {
    res.redirect(model.devMode.config.cors)
  } else {
    next()
  }
}