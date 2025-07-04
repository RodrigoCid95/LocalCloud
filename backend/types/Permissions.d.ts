declare global {
  namespace Permissions {
    interface Permission {
      name: string
      description: string
      enable: boolean
    }
  }
}

export { }