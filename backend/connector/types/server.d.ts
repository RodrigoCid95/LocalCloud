declare global {
  interface FileTransfer {
    on(event: 'progress' | 'end' | 'error' | 'abort', callback: any): void
    off(event: 'progress' | 'end' | 'error' | 'abort', callback: any): void
    readonly progress: number
    start(): void
    cancel(): void
  }
  interface CreateUploaderArgs {
    api?: 'fs' | 'apps'
    path: string[]
    file: FileOptions | FileOptions[]
    metadata?: MetaData
  }
  interface URLParams {
    [key: string]: string | number | boolean
  }
  interface SendArgs {
    endpoint: string
    method: 'get' | 'post' | 'put' | 'delete'
    params?: URLParams
    data?: {
      [k: string]: any
    }
  }
  interface CreateURLArgs {
    path: string[]
    params?: URLParams
  }
}

export { }