import fs from 'node:fs'

export class DevMode implements DevMode.Class {
  #enable: boolean
  get enable(): boolean {
    return this.#enable
  }
  get user(): string {
    return configs.get('devMode')?.user || process.env.USER as string || ''
  }
  constructor() {
    if (isRelease) {
      this.#enable = configs.get('devMode')?.enable || !fs.existsSync(configs.get('paths').system.path)
    } else {
      this.#enable = true
    }
  }
}