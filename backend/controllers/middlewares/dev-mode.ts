export function devMode(_: PXIOHTTP.Request, res: PXIOHTTP.Response, next: PXIOHTTP.Next) {
  const _this: any = this
  if ((_this?.devModeModel as Models<'DevModeModel'>)?.isDevMode?.isDevMode) {
    res.redirect((_this.devModeModel as Models<'DevModeModel'>).isDevMode.cors)
  } else {
    next()
  }
}