export async function verifySetup(_: PXIOHTTP.Request, res: PXIOHTTP.Response, next: Next): Promise<void> {
  if (SETUP) {
    res.redirect('/setup')
  } else {
    next()
  }
}