import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'

export class RecycleBinModel {
  private rbIndicePath = path.resolve('/', 'usr', 'share', 'local-cloud', 'recycle-bin')
  public rbPath = path.resolve('/', 'recycle-bin')

  constructor() {
    if (!fs.existsSync(this.rbIndicePath)) {
      fs.mkdirSync(this.rbIndicePath, { recursive: true })
    }
  }

  public get(name: Users.User['name'], id: string): RecycleBin.Item | undefined
  public get(name: Users.User['name']): RecycleBin.Item[]
  public get(name: Users.User['name'], id?: string): RecycleBin.Item[] | RecycleBin.Item | undefined {
    const rbIndicePath = path.join(this.rbIndicePath, `${name}.json`)
    if (!fs.existsSync(rbIndicePath)) {
      return []
    }
    const content = fs.readFileSync(rbIndicePath, 'utf8')
    const results: RecycleBin.Item[] = JSON.parse(content || '[]')
    if (id) {
      return results.find(i => i.id === id)
    }
    return results
  }

  public put(name: Users.User['name'], itemPath: string[]): crypto.UUID {
    const rbIndicePath = path.join(this.rbIndicePath, `${name}.json`)
    const items = this.get(name)
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const newItem = {
      id: crypto.randomUUID(),
      path: itemPath,
      date: `${year.toString()}/${month < 10 ? `0${month.toString()}` : month.toString()}/${day < 10 ? `0${day.toString()}` : day.toString()} ${hours < 10 ? `0${hours.toString()}` : hours.toString()}:${minutes < 10 ? `0${minutes.toString()}` : minutes.toString()}`
    }
    items.push(newItem)
    const newContent = JSON.stringify(items)
    fs.writeFileSync(rbIndicePath, newContent, 'utf8')
    return newItem.id
  }

  public delete(name: Users.User['name'], id: string): void {
    const rbIndicePath = path.join(this.rbIndicePath, `${name}.json`)
    const items = this
      .get(name)
      .filter(i => i.id !== id)
    const newContent = JSON.stringify(items)
    fs.writeFileSync(rbIndicePath, newContent, 'utf8')
  }

  public clean(name: Users.User['name']): void {
    const rbIndicePath = path.join(this.rbIndicePath, `${name}.json`)
    fs.rmSync(rbIndicePath)
  }
}