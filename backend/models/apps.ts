import type { Database } from 'sqlite3'

declare const Library: PXIO.LibraryDecorator

export class AppsModel {
  @Library('database') private database: Database
  @Library('paths') public paths: Paths.Class
  public assignAppToUser(uuid: Users.User['uuid'], package_name: Apps.App['package_name']): Promise<void> {
    return new Promise(
      resolve =>
        this.database.run(
          'INSERT INTO users_to_apps (uuid, package_name) VALUES (?, ?)',
          [uuid, package_name],
          resolve
        )
    )
  }
  public register(app: Apps.New): Promise<void> {
    return new Promise(
      resolve =>
        this.database.run(
          'INSERT INTO apps (package_name, title, description, author, icon, permissions, font, img, connect, script) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
          [app.package_name, app.title, app.description, app.author, app.icon, app.permissions?.join(';'), app.secureSources?.font, app.secureSources?.img, app.secureSources?.connect, app.secureSources?.script],
          resolve
        )
    )
  }
  private parse(results: Apps.Result[]): Apps.App[] {
    const apps: Apps.App[] = []
    for (const result of results) {
      apps.push({
        package_name: result.package_name,
        title: result.title,
        description: result.description,
        author: result.author,
        icon: result.icon,
        permissions: result.permissions.split(';'),
        secureSources: {
          font: result.font,
          img: result.img,
          connect: result.connect,
          script: result.script
        }
      })
    }
    return apps
  }
  public getAppsByUUID(uuid: string): Promise<Apps.App[]> {
    return new Promise(
      resolve =>
        this.database.all<Apps.Result>(
          'SELECT apps.package_name, apps.title, apps.description, apps.author, apps.icon, apps.permissions, apps.font, apps.img, apps.connect, apps.script FROM users_to_apps INNER JOIN apps ON users_to_apps.package_name = apps.package_name WHERE users_to_apps.uuid = ?;',
          [uuid],
          (error, rows) => error ? resolve([]) : resolve(this.parse(rows))
        )
    )
  }
  public getApps(): Promise<Apps.App[]> {
    return new Promise(
      resolve =>
        this.database.all<Apps.Result>(
          'SELECT * FROM apps',
          (error, rows) => error ? resolve([]) : resolve(this.parse(rows))
        )
    )
  }
}