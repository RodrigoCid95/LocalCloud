declare const KEY: string

const encoder = new TextEncoder()
const decoder = new TextDecoder()
const generateKey = (): Promise<CryptoKey> => {
  return crypto.subtle.importKey('raw', encoder.encode(KEY.slice(0, 16)), { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
}

class Encrypting {
  public async encrypt(data: string): Promise<string> {
    const newKey = await generateKey()
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, newKey, encoder.encode(data)))
    const combined = new Uint8Array(iv.length + encrypted.length)
    combined.set(iv)
    combined.set(encrypted, iv.length)
    let result = ''
    for (let i = 0; i < combined.length; i++) {
      result += combined[i].toString(16).padStart(2, '0')
    }
    return result
  }
  public async decrypt(strEncrypted: string): Promise<string> {
    const newKey = await generateKey()
    let uint8Array = new Uint8Array(strEncrypted.length / 2)
    for (let i = 0; i < strEncrypted.length; i += 2) {
      uint8Array[i / 2] = parseInt(strEncrypted.substr(i, 2), 16)
    }
    const iv = uint8Array.slice(0, 12)
    const data = uint8Array.slice(12, uint8Array.length)
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, newKey, data)
    return decoder.decode(decrypted)
  }
}

export const encrypting: Encrypting = new Encrypting()