import { Emitter } from "./Emitters"

class ClipboardController implements ExplorerClipboard {
  #listeners: ClipboardListener
  #pendingPaste: boolean
  #src: ExplorerClass["selections"] | undefined
  #isCopy: boolean
  get pendingPaste(): boolean {
    return this.#pendingPaste
  }
  constructor() {
    this.#pendingPaste = false
    this.#listeners = {
      change: new Emitter(),
      paste: new Emitter()
    }
    this.#isCopy = false
  }
  copy(src: ExplorerClass["selections"]): void {
    this.#isCopy = true
    this.#src = src
    this.#pendingPaste = true
    this.#listeners.change.emit()
  }
  cut(src: ExplorerClass["selections"]): void {
    this.#isCopy = false
    this.#src = src
    this.#pendingPaste = true
    this.#listeners.change.emit()
  }
  on(event: ClipboardEvents, callback: Callback): void {
    this.#listeners[event].on(callback)
  }
  off(event: ClipboardEvents, callback: Callback): void {
    this.#listeners[event].off(callback)
  }
  async paste(dest: string[]): Promise<void> {
    if (this.pendingPaste) {
      this.#pendingPaste = false
      const method = this.#isCopy ? window.connectors.fs.copy : window.connectors.fs.move
      const sources = this.#src?.map(src => src.split('/')) || []
      const tasks = sources.map(source => method(source as string[], dest))
      await Promise.all(tasks)
      this.#src = undefined
      this.#listeners.paste.emit(dest)
    }
  }
}

export const clipboardController = new ClipboardController()

type ClipboardListener = {
  [event in ClipboardEvents]: Emitter
}