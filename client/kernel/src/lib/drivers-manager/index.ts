import { IDriver, IDriverList, IDriverManager, IKernel } from 'builder/types/kernel'

type ImporterList = {
  [Property in keyof IDriverList]: () => Promise<{ default: IDriver<IDriverList[Property]> }>
}

export class DriversManager implements IDriverManager {
  #driverList: Partial<IDriverList> = {}
  #importerList: ImporterList = {
    emmiters: () => import('./drivers/emmiters')
  }
  constructor(private kernel: IKernel) { }
  async getDriver<K extends keyof IDriverList>(name: K): Promise<IDriverList[K]> {
    if (!this.#importerList[name]) {
      throw new Error(`El driver "${name}" no existe!`)
    }
    if (!this.#driverList[name]) {
      this.#driverList[name] = new (await this.#importerList[name]()).default(this.kernel)
    }
    return this.#driverList[name]
  }
}