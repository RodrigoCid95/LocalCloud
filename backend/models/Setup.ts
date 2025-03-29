export class SetupModel {
  @Library('UserManager') private userManager: UserManager.Class
  @Library('SMBManager') private smbManager: SMBManager.Class
  @Library('Encrypt') private encrypt: Encrypting.Class
  @Library('GroupManager') private groupManager: GroupManager.Class

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