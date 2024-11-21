export class SetupModel {
  @Library('userManager') private userManager: UserManager.Class
  @Library('smbManager') private smbManager: SMBManager.Class
  @Library('encrypt') private encrypt: Encrypting.Class
  @Library('groupManager') private groupManager: GroupManager.Class

  public getUsers(): Users.Result[] {
    return this.userManager.getAll(true)
  }

  public verifyPassword(hash: string, password: string): boolean {
    return this.encrypt.verifyHash(password, hash)
  }

  public createUser(name: string, password: string): Users.User['uid'] {
    const uid = this.userManager.create({
      name,
      password,
      full_name: '',
      email: '',
      phone: ''
    })
    this.smbManager.create(name)
    return uid
  }

  public addToGroup(name: Users.User['name']): void {
    this.groupManager.addUser(name)
  }

  public reboot(): void {
    setTimeout(() => {
      process.exit(0)
    }, 1000)
  }
}