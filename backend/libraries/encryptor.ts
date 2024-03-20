import { Encrypt } from './classes/Encrypt'

export const encrypt: () => Encrypt = (): Encrypt => new Encrypt()