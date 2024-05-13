declare global {
  namespace Encrypting {
    interface Class {
      createHash(plaintext: string, salt?: string): string
      verifyHash(plaintext: string, hash: string): boolean
      encrypt(key: string, data: string): Promise<string>
      decrypt(key: string, strEncrypted: string): Promise<string>
    }
  }
}
export { }