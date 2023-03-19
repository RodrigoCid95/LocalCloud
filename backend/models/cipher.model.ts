import { CipherClass } from "types/Cipher"
import { Lib } from 'phoenix-js/core'

export class CipherModel {
  @Lib('cipher') private cipher: CipherClass
  public encrypt(data: any, key: string) {
    return this.cipher.encrypt(key, JSON.stringify(data))
  }
}