type Callback<T = undefined> = (args: T) => void
export interface IEmmiter {
    on<T = undefined>(callback: Callback<T>): Promise<string>
    off(uuid: string): Promise<void>
    emmit<T = {}>(args?: T): Promise<void>
}
export interface IEmmiters {
    on<T = undefined>(event: string, callback: Callback<T>): Promise<void>
    off(event: string, uuid: string): Promise<void>
    emmit<T = undefined>(event: string, args?: T): Promise<void>
}