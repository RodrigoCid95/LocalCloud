declare global {
  namespace Encrypting {
    interface Class {
      setKey(key: string): void
      encrypt(data: string): Promise<string>
      decrypt(strEncrypted: string): Promise<string>
    }
  }
}
export { }