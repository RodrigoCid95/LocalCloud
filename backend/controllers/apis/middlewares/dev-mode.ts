export function verifyDevMode(): Models<'DevModeModel'> | boolean {
  const _this: any = this
  const devModeModel = _this?.devModeModel as Models<'DevModeModel'>
  if (devModeModel?.devMode.config.isDevMode) {
    return devModeModel
  }
  return false
}