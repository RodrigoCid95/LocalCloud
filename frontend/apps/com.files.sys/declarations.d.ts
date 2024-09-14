declare global {
  interface Transfer {
    name: string
    fileTransfer: FileTransfer
  }
  interface TransfersClass {
    readonly list: Transfer[]
    add(upload: Transfer): void
    remove(index: number): void
    on(callback: any): any
    off(callback: any): any
  }
  type Callback = (...args: any[]) => void | Promise<void>
  type ExplorerEvents = 'change' | 'selectableChange' | 'selectionChange'
  interface ExplorerClass {
    path: string[]
    selectable: boolean
    readonly selections: string[]
    addSelection(path: string[]): void
    removeSelection(path: string[]): void
    on(event: ExplorerEvents, callback: Callback): void
    off(event: ExplorerEvents, callback: Callback): void
  }
  type ClipboardEvents = 'change' | 'paste'
  interface ExplorerClipboard {
    readonly pendingPaste: boolean
    copy(src: ExplorerClass['selections']): void
    cut(src: ExplorerClass['selections']): void
    on(event: ClipboardEvents, callback: Callback): void
    off(event: ClipboardEvents, callback: Callback): void
    paste(dest: string[]): Promise<void>
  }
  interface EmitterClass {
    on(callback: Callback): void
    off(callback: Callback): void
    emit(...args: any[]): void
  }
  interface EmittersClass {
    on(event: string, callback: Callback): void
    off(event: string, callback: Callback): void
    emit(event: string, ...args: any[]): void
  }
}

export { }