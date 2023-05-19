import { IEmmiters } from "./drivers/emmiter"

export interface ITaskManager {
}
export interface ITaskManagerClass {
  new(): ITaskManager
}
export interface IDriverManager {
  getDriver<K extends keyof IDriverList>(name: K): Promise<IDriverList[K]>
}
export interface IDriverList {
  emmiters: IEmmiters
}
export interface IControllersManagerClass {
  new(): IDriverManager
}
export interface IDriver<T> {
  new(kernel: IKernel): T
}
export interface IKernel {
  TaskManager: ITaskManager
  DriverManager: IDriverManager
}