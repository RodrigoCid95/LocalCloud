export type CallbackEmitter<T = undefined> = (args: T) => void | Promise<void>
export interface EmitterDriver {
	on<T = undefined>(callback: CallbackEmitter<T>): string
	off(uuid: string): void
	emmit<T = {}>(args?: T): void
}
export declare class EmittersDriver {
	static createEmitter(): EmitterDriver
	on<T = undefined>(event: string, callback: CallbackEmitter<T>): string
	off(event: string, uuid: string): void
	emmit<T = undefined>(event: string, args?: T): void
}
export interface EmitterConstructable  {
	new(): EmitterDriver
}
export interface EmittersConstructable  {
	new(): EmittersDriver
}