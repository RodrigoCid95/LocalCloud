class Transfers implements TransfersClass {
  #list: Transfer[] = []
  #listeners: any[] = []
  get list() {
    return this.#list
  }
  #dispatch() {
    for (const listener of this.#listeners) {
      listener()
    }
  }
  add(upload: Transfer) {
    this.#list.push(upload)
    this.#dispatch()
  }
  remove(index: number) {
    this.#list.splice(index, 1)
    this.#dispatch()
  }
  on(callback: any) {
    this.#listeners.push(callback)
  }
  off(callback: any) {
    this.#listeners = this.#listeners.filter(listener => listener !== callback)
  }
}

export const transfers = {
  uploads: new Transfers(),
  downloads: new Transfers()
}