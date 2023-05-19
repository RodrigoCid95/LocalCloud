import { IDriverManager, IKernel, ITaskManager } from 'builder/types/kernel'
import { IServerConnector } from 'builder/types/server'
import { IOSClass } from 'builder/types/os'
import { ServerConnectorClass } from './server-connector'
import { TaskManagerClass } from './task-manager'
import { DriversManager } from './drivers-manager'

export default class KernelClass implements IKernel {
  serverConnector: IServerConnector
  TaskManager: ITaskManager
  DriverManager: IDriverManager
  constructor() {
    this.serverConnector = new ServerConnectorClass()
    this.serverConnector.onConnect(this.run.bind(this))
    this.TaskManager = new TaskManagerClass()
    this.DriverManager = new DriversManager(this)
  }
  async run() {
    const osPath = '/js/os/main.js'
    const { default: OS }: { default: IOSClass } = await import(osPath)
    const os = new OS(this)
    const splashScreen = await os.SplashScreen.render()
    if (typeof splashScreen === 'string') {
      document.body.innerHTML = splashScreen
    } else {
      document.body.innerHTML = ''
      document.body.append(splashScreen)
    }
  }
}