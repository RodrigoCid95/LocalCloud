import { verifyDevMode } from "./dev-mode"

const DENIED_ERROR = {
  code: 'access-denied',
  message: 'No tienes permiso para hacer esto!'
}

export const getOrigin = (referer: string): Origin => {
  const { pathname } = new URL(referer)
  if (pathname === '/') {
    return 1
  }
  if (/^\/app\/.+$/.test(pathname)) {
    const segments = origin.split('/')
    return segments[2]
  }
  return 0
}

export function verifyPermission(permission: APIPermission | string) {
  let apiPermission: APIPermission
  if (typeof permission === 'string') {
    apiPermission = {
      name: permission as any,
      public: false,
      freeForDashboard: false
    }
  } else {
    apiPermission = permission
  }
  return async function (req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: PXIOHTTP.Next): Promise<void> {
    if (verifyDevMode.bind(this)()) {
      next()
      return
    }
    if (req.headers.referer === undefined) {
      res.status(403).json(DENIED_ERROR)
      return
    }
    if (req.headers.token === undefined) {
      res.status(403).json(DENIED_ERROR)
      return
    }
    const origin = getOrigin(req.headers.referer)
    if (typeof origin === 'string') {
      const { permissions } = (req.session.apps as LocalCloud.SessionApps)[origin]
      const appPermission: Permissions.Permission | undefined = permissions.filter(item => item.api === apiPermission.name)[0]
      if (appPermission?.active) {
        next()
        return
      }
    } else {
      if (origin === 0 && apiPermission.public) {
        next()
        return
      }
      if (origin === 1 && apiPermission.freeForDashboard) {
        next()
        return
      }
    }
    res.status(403).json(DENIED_ERROR)
  }
}

type Origin = 0 | 1 | string

declare global {
  interface APIPermission {
    name: Uppercase<string>
    public: boolean
    freeForDashboard: boolean
  }
  interface APIPermissionList {
    [name: string]: string | APIPermission
  }
}