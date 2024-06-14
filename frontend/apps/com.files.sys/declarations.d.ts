declare global {
  interface Transfer {
    name: string
    fileTransfer: FileTransfer
  }
  interface Transfers {
    readonly list: Transfer[]
    add(upload: Transfer): void
    remove(index: number): void
    on(callback: any): any
    off(callback: any): any
  }
  interface ExplorerClipboard {
    readonly pendingPaste: boolean
    toCopy(src: string[] | string[][]): void
    toCut(src: string[] | string[][]): void
    on(callback: any): void
    off(callback: any): void
    paste(dest: string[]): Promise<void>
  }
  interface Emitter {
    on(callback: any): void
    off(callback: any): void
    emit(): void
  }
  interface Window {
    explorerClipboard: ExplorerClipboard
    uploads: Transfers
    downloads: Transfers
    createEmitter(): Emitter
  }
}

export { }