declare global {
  namespace Encrypting {
    interface Class {
      encrypt(key: string, data: string): Promise<string>
      decrypt(key: string, strEncrypted: string): Promise<string>
    }
  }
}
export { }