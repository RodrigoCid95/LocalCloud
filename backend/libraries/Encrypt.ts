import crypto from 'node:crypto'
import { quote } from 'shell-quote'
import { process } from './process'

export class Encrypt implements Encrypting.Encrypt {
  private process: Process.Run = process()
  private encoder = new TextEncoder()
  private decoder = new TextDecoder()

  public createHash(plaintext: string, salt?: string): Promise<string> {
    const saltArg = salt ? ['-salt', quote([salt])] : []
    return new Promise<string>((resolve) => {
      this.process({
        title: 'Encrypt',
        command: 'openssl',
        args: ['passwd', '-6', ...saltArg, quote([plaintext])],
        out(output) {
          const hash = output.split('\n')
          resolve(hash[0])
        }
      })
    })
  }

  public async verifyHash(plaintext: string, hash: string): Promise<boolean> {
    const salt = hash.split('$')[2]
    const newHash = await this.createHash(plaintext, salt)
    return newHash === hash
  }

  private generateKey(key: string): Promise<crypto.webcrypto.CryptoKey> {
    return crypto.subtle.importKey('raw', this.encoder.encode(key.slice(0, 16)), { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
  }

  public async encrypt(key: string, data: string): Promise<string> {
    const newKey = await this.generateKey(key)
    const iv: Uint8Array = crypto.getRandomValues(new Uint8Array(12))
    const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, newKey, this.encoder.encode(data)))
    const combined = new Uint8Array(iv.length + encrypted.length)
    combined.set(iv)
    combined.set(encrypted, iv.length)
    let result: string = ''
    for (let i: number = 0; i < combined.length; i++) {
      result += combined[i].toString(16).padStart(2, '0')
    }
    return result
  }

  public async decrypt(key: string, strEncrypted: string): Promise<string> {
    const newKey = await this.generateKey(key)
    let uint8Array = new Uint8Array(strEncrypted.length / 2)
    for (let i: number = 0; i < strEncrypted.length; i += 2) {
      uint8Array[i / 2] = parseInt(strEncrypted.substr(i, 2), 16)
    }
    const iv: Uint8Array = uint8Array.slice(0, 12)
    const data: Uint8Array = uint8Array.slice(12, uint8Array.length)
    const decrypted: ArrayBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, newKey, data)
    return this.decoder.decode(decrypted)
  }
}