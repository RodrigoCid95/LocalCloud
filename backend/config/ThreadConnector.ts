import crypto from 'node:crypto'

export class ThreadConnector {
  #CALLBACKS: {
    [x: string]: any
  }
  constructor(private namespace: string) {
    this.#CALLBACKS = {}
    process.on('message', message => {
      const { uid, data } = message as any
      if (this.#CALLBACKS[uid] !== undefined) {
        this.#CALLBACKS[uid](data)
        delete this.#CALLBACKS[uid]
      }
    })
  }
  async emit(event: string, ...args: any[]) {
    return new Promise(resolve => {
      const uid = crypto.randomUUID()
      this.#CALLBACKS[uid] = (data: any) => resolve(data)
      if (process.send) {
        process.send({ uid, event: `${this.namespace}:${event}`, args })
      }
    })
  }
}