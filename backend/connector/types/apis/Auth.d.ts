declare global {
  namespace Auth {
    interface Credentials {
      userName: string
      password: string
    }
    interface LoginOkResult {
      ok: true
    }
    interface LoginFailResult {
      ok: false
      message: string
    }
    type LoginMethod = (credentials: Credentials) => Promise<LoginOkResult | LoginFailResult>
    type StatusMethod = () => Promise<Boolean>
    type LogOutMethod = () => Promise<void>
    interface Connector {
      logIn?: LoginMethod
      status?: StatusMethod
      logOut?: LogOutMethod
    }
  }
}

export { }