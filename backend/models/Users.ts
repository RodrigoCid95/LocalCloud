import path from 'node:path'
import fs from 'node:fs'

export class UsersModel {
  @Library('UsersManager') private usersManager: Users.Manager
  @Library('SambaManager') private sambaManager: Samba.Manager
  @Library('Encrypt') private encrypt: Encrypting.Encrypt

  private home: string = path.resolve('/', 'home')
  private appsAssignmentsPath = path.resolve('/', 'usr', 'share', 'local-cloud', 'apps', 'assignments')

  public async create(user: Users.New): Promise<void> {
    const { name, password, fullName: full_name = '', email = '', phone = '' } = user
    await this.usersManager.create({ name, password, fullName: full_name, email, phone })
    this.sambaManager.create(name, { comment: `Directorio de ${full_name || name}` })
  }

  public async getByQuery({ uid, name, fullName, email, phone }: Partial<Users.User>): Promise<Users.User[]> {
    const results = await this.getAll()
    const userList: Users.User[] = results
      .filter(user => {
        if (uid && user.uid.toString().includes(uid.toString())) {
          return true
        }
        if (name && user.name.includes(name)) {
          return true
        }
        if (fullName && user.fullName.includes(fullName)) {
          return true
        }
        if (email && user.email.includes(email)) {
          return true
        }
        if (phone && user.phone.includes(phone)) {
          return true
        }
        return false
      })
    return userList
  }

  public async getByName(name: Users.User['name']): Promise<Users.User | null> {
    const result = await this.usersManager.get(name)
    if (result) {
      const { uid, name, fullName: full_name, email, phone } = result
      return { uid, name, fullName: full_name, email, phone }
    }
    return null
  }

  public async getByUID(uid: Users.User['uid']): Promise<Users.User | null> {
    const results = await this.usersManager.getAll()
    const user = results.find(u => u.uid === uid)
    if (user) {
      const { uid, name, fullName: full_name, email, phone } = user
      return { uid, name, fullName: full_name, email, phone }
    }
    return null
  }

  public async getAll(): Promise<Users.User[]> {
    const results = await this.usersManager.getAll()
    const userList = results.map(({ uid, name, fullName, email, phone }) => ({ uid, name, fullName, email, phone }))
    return userList
  }

  public async verfyPassword(name: Users.User['name'], password: string): Promise<boolean> {
    const user = await this.usersManager.get(name)
    if (user) {
      const verification = await this.encrypt.verifyHash(password, user.password_hash)
      return verification
    }
    return false
  }

  public update(name: Users.User['name'], data: Omit<Omit<Users.User, 'name'>, 'uid'>): Promise<void> {
    return this.usersManager.update(name, data)
  }

  public updatePassword(name: Users.User['name'], password: string): Promise<void> {
    return this.usersManager.setPassword(name, password)
  }

  public async delete(name: Users.User['name']): Promise<void> {
    const user = await this.usersManager.get(name)
    if (user) {
      await this.usersManager.delete(user.uid)
      this.sambaManager.delete(user.name)
    }
  }

  public async setConfig(name: Users.User['name'], config: Users.Config): Promise<void> {
    const user = await this.usersManager.get(name)
    if (user) {
      const userConfigPath = path.join(this.home, name, '.lc')
      const strConfig = JSON.stringify(config)
      fs.writeFileSync(userConfigPath, strConfig, 'utf8')
    }
  }

  public async getConfig(name: Users.User['name']): Promise<Users.Config> {
    const user = await this.usersManager.get(name)
    if (user) {
      const userConfigPath = path.join(this.home, name, '.lc')
      if (fs.existsSync(userConfigPath)) {
        const configContent = fs.readFileSync(userConfigPath, 'utf8')
        return JSON.parse(configContent || '{}')
      }
    }
    return {}
  }

  private readAssignments(): Assignments {
    if (!fs.existsSync(this.appsAssignmentsPath)) {
      return {}
    }
    const assignmentsContent = fs.readFileSync(this.appsAssignmentsPath, 'utf8')
    const assignments = JSON.parse(assignmentsContent)
    return assignments
  }

  private writeAssignments(assignments: Assignments): void {
    const assignmentsContent = JSON.stringify(assignments)
    fs.writeFileSync(this.appsAssignmentsPath, assignmentsContent, 'utf8')
  }

  public assignApp(uid: Users.User['uid'], package_name: string): void {
    const assignments = this.readAssignments()
    if (!assignments[uid]) {
      assignments[uid] = []
    }
    if (!assignments[uid].includes(package_name)) {
      assignments[uid].push(package_name)
    }
    this.writeAssignments(assignments)
  }

  public unassignApp(uid: Users.User['uid'], package_name: string): void {
    const assignments = this.readAssignments()
    if (!assignments[uid]) {
      assignments[uid] = []
    }
    if (assignments[uid].includes(package_name)) {
      assignments[uid] = assignments[uid].filter(a => a !== package_name)
    }
    this.writeAssignments(assignments)
  }
}

interface Assignments {
  [x: Users.User['uid']]: string[]
}