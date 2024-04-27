declare global {
  namespace Profile {
    type InfoMethod = () => Promise<Users.User>
    type ListAppsMethod = () => Promise<Apps.App[]>
    type UpdateMethod = (data: Partial<Omit<Omit<Users.User, 'uuid'>, 'photo'>>) => Promise<void>
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
    interface Connector {
      info: InfoMethod
      listApps: ListAppsMethod
      update: UpdateMethod
      updatePassword: UpdatePasswordMethod
    }
  }
}

export { }