import type { EncryptorLib } from 'interfaces/Encryptor'
import crypto from 'node:crypto'

export class Encryptor implements EncryptorLib {
  private encoder = new TextEncoder()
  private decoder = new TextDecoder()
  private generateKey(key: string): Promise<crypto.webcrypto.CryptoKey> {
    return crypto.subtle.importKey('raw', this.encoder.encode(key.slice(0, 16)), { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
  }
  public async encrypt(key: string, data: string): Promise<string> {
    const newKey = await this.generateKey(key)
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, newKey, this.encoder.encode(data)))
    const combined = new Uint8Array(iv.length + encrypted.length)
    combined.set(iv)
    combined.set(encrypted, iv.length)
    let result = ''
    for (let i = 0; i < combined.length; i++) {
      result += combined[i].toString(16).padStart(2, '0')
    }
    return result
  }
  public async decrypt(key: string, strEncrypted: string): Promise<string> {
    const newKey = await this.generateKey(key)
    let uint8Array = new Uint8Array(strEncrypted.length / 2)
    for (let i = 0; i < strEncrypted.length; i += 2) {
      uint8Array[i / 2] = parseInt(strEncrypted.substr(i, 2), 16)
    }
    const iv = uint8Array.slice(0, 12)
    const data = uint8Array.slice(12, uint8Array.length)
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, newKey, data)
    return this.decoder.decode(decrypted)
  }
}