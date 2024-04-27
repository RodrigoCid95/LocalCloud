declare global {
  namespace FS {
    interface ItemInfo {
      name: string
      size: number
      lastModification: Date
      creationDate: Date
      isFile: boolean
    }
    interface PathNotFound {
      code: 'not-found'
      message: string
    }
    type SharedLsMethod = (path: string[]) => Promise<ItemInfo[] | PathNotFound>
    type UserLsMethod = (path: string[]) => Promise<ItemInfo[] | PathNotFound>
    type SharedMkdirMethod = (path: string[]) => Promise<void>
    type UserMkdirMethod = (path: string[]) => Promise<void>
    interface UploadFileOptions {
      file: File
      path: string[]
    }
    type SharedUploadMethod = (opts: UploadFileOptions) => FileTransfer
    type UserUploadMethod = (opts: UploadFileOptions) => FileTransfer
    type SharedRmMethod = (path: string[]) => Promise<void>
    type UserRmMethod = (path: string[]) => Promise<void>
    type CopyMethod = (origin: string[], dest: string[]) => Promise<void>
    type MoveMethod = (origin: string[], dest: string[]) => Promise<void>
    type RenameMethod = (path: string[], newName: string) => Promise<void>
    interface Connector {
      sharedLs: SharedLsMethod
      userLs: UserLsMethod
      sharedMkdir: SharedMkdirMethod
      userMkdir: UserMkdirMethod
      sharedUpload: SharedUploadMethod
      userUpload: UserUploadMethod
      sharedRm: SharedRmMethod
      userRm: UserRmMethod
      copy: CopyMethod
      move: MoveMethod
      rename: RenameMethod
    }
  }
}

export { }