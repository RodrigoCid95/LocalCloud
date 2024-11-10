export class DevMode implements DevMode.Class {
  get enable(): boolean {
    return getConfig('devMode')?.enable || false
  }
  get user(): string {
    return getConfig('devMode')?.user || process.env.USER as string || ''
  }
}