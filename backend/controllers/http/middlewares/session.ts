export async function session(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: Next): Promise<void> {
  if (req.session.user) {
    next()
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
    if (req.originalUrl === '/') {
      res.redirect('/login')
    } else {
      res.redirect(`/login?dest=${req.originalUrl}`)
    }
  }
}

export const notSession: PXIOHTTP.Middleware = (req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: Next): void => {
  if (!req.session.user) {
    next()
  } else {
    if (req.query.dest) {
      res.redirect(req.query.dest as string)
    } else {
      res.redirect('/')
    }
  }
}