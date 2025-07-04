declare global {
  namespace FileSystem {
    type Path = string[]
    interface ItemInfo {
      name: string
      size: number
      lastModification: Date
      creationDate: Date
      isFile: boolean
    }
  }
}

export { }