import { IEmmiters } from "./drivers/emmiter"

export interface ITask<T> {
  PID: string
  icon?: string
  title: string
  description: string
  readonly el: T
  kill(): void
}
export interface ITaskClass<T> {
  new(el: T): ITask<T>
}
export interface ITaskManager {
  run<T>(el: T): ITask<T>
}
export interface ITaskManagerClass {
  new(): ITaskManager
}
export interface IDriverList {
  emmiters: IEmmiters
}
export interface IDriverManager {
  getDriver<K extends keyof IDriverList>(name: K): Promise<IDriverList[K]>
}
export interface IDriverManagerClass {
  new(): IDriverManager
}
export interface IDriver<T> {
  new(kernel: IKernel): T
}
export interface IKernel {
  TaskManager: ITaskManager
  DriverManager: IDriverManager
}