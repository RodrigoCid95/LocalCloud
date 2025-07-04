const DENIED_ERROR = {
  code: 'access-denied',
  message: 'No tienes permiso para hacer esto!'
}

export class BaseAPI {
  @Model('BuilderModel') private buildModel: Models<'BuilderModel'>

  public getOrigin(referer?: string): Origin {
    if (referer) {
      const { pathname } = new URL(referer)
      if (pathname === '/') {
        return 1
      }
      if (/^\/app\/.+$/.test(pathname)) {
        const segments = pathname.split('/')
        return segments[2]
      }
    }
    return 0
  }

  public verifyPermission(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: Next): void {
    if (process.env.ROOT_MODE === 'true') {
      next()
      return
    }
    if (this.checkPermission(req, (req as any).permission)) {
      next()
      return
    }
    res.status(403).json(DENIED_ERROR)
  }

  public checkPermission(req: PXIOHTTP.Request<LocalCloud.SessionData>, permission: string): boolean {
    if (process.env.ROOT_MODE === 'true') {
      return true
    }
    if (req.headers.referer === undefined) {
      return false
    }
    if (req.headers.token === undefined) {
      return false
    }
    const origin = this.getOrigin(req.headers.referer)
    const token = req.header('token')
    if (req.session.user) {
      if (
        origin === 0 &&
        this.buildModel.builder.publicApiList.includes(permission) &&
        token === req.session.token
      ) {
        return true
      }

      if (
        origin === 1 &&
        this.buildModel.builder.dashApiList.includes(permission) &&
        token === req.session.token
      ) {
        return true
      }

      if (
        typeof origin === 'string' &&
        req.session.apps?.[origin]?.permissions.includes(permission) &&
        token === req.session.apps[origin].token
      ) {
        return true
      }
    } else {
      if (
        this.buildModel.builder.publicApiList.includes(permission) &&
        token === req.session.token
      ) {
        return true
      }
    }

    return false
  }
}

type Origin = 0 | 1 | string