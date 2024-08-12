import type { Db } from 'mongodb'
import fs from 'node:fs'
import crypto from 'node:crypto'

declare const Library: PXIO.LibraryDecorator

export class DevModeModel {
  @Library('devMode') public devMode: DevMode.Class
  @Library('mongo') private db: Db
  @Library('paths') paths: Paths.Class
  public getUser(): Users.User | undefined {
    const PASSWD_CONTENT = fs.readFileSync(this.paths.passwd, 'utf8')
    const PASSWD_LINES = PASSWD_CONTENT.split('\n').filter(line => line !== '')
    const USER_LIST = PASSWD_LINES.map(line => line.split(':'))
    const result = USER_LIST.find(us => us[0] === this.devMode.user)
    if (result) {
      const name = result[0]
      const [full_name = '', email = '', phone = ''] = result[4].split(',')
      return {
        uid: Number(result[2]),
        name,
        full_name,
        email,
        phone
      }
    }
  }
  public async getApps(uid: Users.User['uid']): Promise<LocalCloud.SessionData['apps']> {
    const apps = await this.db
      .collection<Apps.App>('apps')
      .find({ uid })
      .toArray()
      .then(results => results.map(({ package_name, title, description, author, useTemplate }) => ({ package_name, title, description, author, useTemplate })))
    const appList: LocalCloud.SessionData['apps'] = {}
    for (const app of apps) {
      const sessionApp: LocalCloud.SessionApp = {
        token: crypto.randomUUID(),
        ...app,
        secureSources: [],
        permissions: []
      }
      appList[app.package_name] = sessionApp
    }
    return appList
  }
}