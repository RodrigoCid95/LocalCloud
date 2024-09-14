import { Emitter } from "./Emitters"

class ExplorerController implements ExplorerClass {
  #listeners: ExplorerListener
  #path: string[] = []
  #selectable: boolean = false
  #selections: string[] = []
  get path() {
    return [...this.#path]
  }
  set path(path: string[]) {
    this.#selections = []
    this.#listeners.selectionChange.emit()
    this.selectable = false
    this.#path = [...path]
    this.#listeners.change.emit()
  }
  get selectable() {
    return this.#selectable
  }
  set selectable(selectable: boolean) {
    this.#selectable = selectable
    if (!selectable) {
      this.#selections = []
      this.#listeners.selectionChange.emit()
    }
    this.#listeners.selectableChange.emit()
  }
  get selections() {
    return this.#selections
  }
  constructor() {
    this.#listeners = {
      change: new Emitter(),
      selectableChange: new Emitter(),
      selectionChange: new Emitter()
    }
  }
  addSelection(path: string[]): void {
    this.#selections.push(path.join('/'))
    this.#listeners.selectionChange.emit()
  }
  removeSelection(path: string[]): void {
    const index = this.#selections.indexOf(path.join('/'))
    if (index > -1) {
      this.#selections.splice(index, 1)
    }
    this.#listeners.selectionChange.emit()
  }
  on(event: ExplorerEvents, callback: Callback): void {
    this.#listeners[event].on(callback)
  }
  off(event: ExplorerEvents, callback: Callback): void {
    this.#listeners[event].off(callback)
  }
}

const explorerController = new ExplorerController()

export { explorerController }

type ExplorerListener = {
  [event in ExplorerEvents]: Emitter
}