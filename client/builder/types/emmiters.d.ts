export interface IEmmiter {
    on<T = undefined>(callback: (args: T) => void): Promise<string>
    off(uuid: string): Promise<void>
    emmit<T = {}>(args?: T): Promise<void>
}
export interface IEmmiters {
    on<T = undefined>(event: string, callback: (args: T) => void): Promise<void>
    off(event: string, uuid: string): Promise<void>
    emmit<T = undefined>(event: string, args?: T): Promise<void>
}