export interface CipherClass {
  encrypt(key: string, data: string): Promise<string>
  decrypt(key: string, strEncrypted: string): Promise<any>
}