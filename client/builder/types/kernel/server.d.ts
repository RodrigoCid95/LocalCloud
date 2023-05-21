export enum Methods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}
export type SendArguments = {
  path: string
  method: Methods
  data?: any
  encryptRequest?: boolean
  decryptResponse?: boolean
}
export type Callback<T> = (response: T) => void | Promise<void>
export interface IServerConnector {
  socket: any
  onConnect(callback: () => void | Promise<void>): void
  send<T = null>(args: SendArguments): Promise<T>
  emit<T = null>(event: string, data?: object): Promise<T>
  on<T = {}>(event: string, callback: Callback<T>): Promise<void>
}
export type Response<T> = {
  data: T
  error: {
    message: string
    stack: string
  }
}