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
      code: 'user-not-found' | 'incorrect-password'
      message: string
    }
    type LoginMethod = (credentials: Credentials) => Promise<LoginOkResult | LoginFailResult>
    type OnChangeStatus = (callback: (auth: boolean) => void) => Promise<void>
    type StatusMethod = () => Promise<boolean>
    type LogOutMethod = () => Promise<void>
    interface Connector {
      logIn?: LoginMethod
      status?: StatusMethod
      logOut?: LogOutMethod
      onChange?: OnChangeStatus
    }
  }
}

export { }