export function devMode(_: PXIOHTTP.Request, res: PXIOHTTP.Response, next: PXIOHTTP.Next) {
  const _this: any = this
  if ((_this?.devModeModel as Models<'DevModeModel'>)?.isDevMode?.isDevMode) {
    res.render('dev-mode', { title: 'Modo desarrollo habilitado.', description: 'La interfaz está deshabilitada.' })
  } else {
    next()
  }
}