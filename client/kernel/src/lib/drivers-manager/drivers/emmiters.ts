import { IEmmiter, Callback, IEmmiters } from 'builder/types/kernel/drivers/emmiter'

class EmmiterClass implements IEmmiter {
  #callbacks: { [uuid: string]: Callback }
  constructor() {
    this.#callbacks = {}
  }
  async on<T = undefined>(callback: Callback<T>): Promise<string> {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    })
    this.#callbacks[uuid] = callback
    return uuid
  }
  async off(uuid: string): Promise<void> {
    delete this.#callbacks[uuid]
  }
  async emmit<T = undefined>(args?: T): Promise<void> {
    const callbacks = Object.values(this.#callbacks)
    for (const callback of callbacks) {
      callback(args as any)
    }
  }
}

export default class EmmitersClass implements IEmmiters {
  #emmiters: Map<string, IEmmiter>
  constructor() {
    this.#emmiters = new Map()
  }
  async on<T = undefined>(event: string, callback: Callback<T>): Promise<void> {
    if (!this.#emmiters.has(event)) {
      this.#emmiters.set(event, new EmmiterClass())
    }
    this.#emmiters.get(event).on(callback)
  }
  async off(event: string, uuid: string): Promise<void> {
    if (this.#emmiters.has(event)) {
      this.#emmiters.get(event).off(uuid)
    }
  }
  async emmit<T = undefined>(event: string, args?: T): Promise<void> {
    if (this.#emmiters.has(event)) {
      this.#emmiters.get(event).emmit(args)
    }
  }
}