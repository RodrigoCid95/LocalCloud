declare global {
  namespace Encrypting {
    interface Encrypt {
      createHash(plaintext: string, salt?: string): Promise<string>
      verifyHash(plaintext: string, hash: string): Promise<boolean>
      encrypt(key: string, data: string): Promise<string>
      decrypt(key: string, strEncrypted: string): Promise<string>
    }
  }
}
export { }