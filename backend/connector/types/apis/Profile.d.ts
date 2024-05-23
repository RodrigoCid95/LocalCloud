declare global {
  namespace Profile {
    type InfoMethod = () => Promise<Users.User>
    type ListAppsMethod = () => Promise<Apps.App[]>
    type UpdateMethod = (data: Partial<Omit<Users.User, 'uid'>>) => Promise<void>
    interface UpdatePasswordSuccess {
      ok: true
    }
    interface UpdatePasswordFail {
      ok: false
      message: string
    }
    interface UpdatePasswordMethodArgs {
      current_password: string
      new_password: string
    }
    type UpdatePasswordMethod = (data: UpdatePasswordMethodArgs) => Promise<UpdatePasswordSuccess | UpdatePasswordFail>
    interface Config {
      ionic?: {}
    }
    type GetConfigMethod = () => Promise<Profile.Config>
    type SetConfigMethod = (config: Profile.Config) => Promise<void>
    interface Connector {
      info: InfoMethod
      listApps: ListAppsMethod
      update: UpdateMethod
      updatePassword: UpdatePasswordMethod
      getConfig: GetConfigMethod
      setConfig: SetConfigMethod
    }
  }
}

export { }