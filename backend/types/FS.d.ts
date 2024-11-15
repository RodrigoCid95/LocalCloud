declare global {
  namespace FileSystem {
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