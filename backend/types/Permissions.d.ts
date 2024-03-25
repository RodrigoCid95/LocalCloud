declare global {
  namespace Permissions {
    interface Permission {
      id: number
      api: `${string}:${number}`
      description: string
    }
    interface Result {
      id_permission: number
      api: string
      level: number
    }
  }
}

export { }