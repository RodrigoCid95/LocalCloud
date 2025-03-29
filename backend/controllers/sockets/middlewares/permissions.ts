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
    const segments = pathname.split('/')
    return segments[2]
  }
  return 0
}

export const verifyPermission = (permission: APIPermission | string): PXIOSockets.Middleware<string> => {
  if (SETUP) {
    return () => null
  }
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
  return ({ socket }) => {
    if (socket.handshake.headers.referer === undefined || socket.handshake.auth.token === undefined) {
      throw DENIED_ERROR
    }
    const origin = getOrigin(socket.handshake.headers.referer)
    if (typeof origin === 'string') {
      const { permissions } = socket.request.session.apps[origin]
      const appPermission: Permissions.Permission | undefined = permissions.filter((item: { api: string }) => item.api === apiPermission.name)[0]
      if (appPermission?.active) {
        return
      }
    } else {
      if (origin === 0 && apiPermission.public) {
        return
      }
      if (origin === 1 && apiPermission.freeForDashboard) {
        return
      }
    }
    throw DENIED_ERROR
  }
}

type Origin = 0 | 1 | string