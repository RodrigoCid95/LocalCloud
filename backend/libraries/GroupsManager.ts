import fs from 'node:fs'
import path from 'node:path'
import { quote } from 'shell-quote'
import { process } from './process'

export class GroupManager implements Groups.Manager {
  private process: Process.Run = process()
  private group: string = path.resolve('/', 'etc', 'group')

  private loadGroups(): Groups.Group[] {
    const content = fs.readFileSync(this.group, 'utf8')
    const groups: Groups.Group[] = content
      .split('\n')
      .filter(line => line !== '')
      .map(line => {
        const [name, _, gid, userList] = line.split(':')
        const users = userList.split(',')
        return { gid: Number(gid), name, users }
      })
    return groups
  }

  public async addGroup(name: Groups.Group["name"]): Promise<Groups.Group["gid"]> {
    const groups = this.loadGroups()
    const groupIndex = groups.findIndex(group => group.name === name)
    if (groupIndex === -1) {
      await this.process({
        title: `Create group (${name})`,
        command: 'groupadd',
        args: [quote([name])]
      })
      return this.addGroup(name)
    }
    return groups[groupIndex].gid
  }

  public async removeGroup(name: Groups.Group["name"]): Promise<void> {
    const groups = this.loadGroups()
    const groupIndex = groups.findIndex(group => group.name === name)
    if (groupIndex !== -1) {
      await this.process({
        title: `Remove Group (${name})`,
        command: 'groupdel',
        args: [quote([name])]
      })
    }
  }
  
  public async addUser(user: string): Promise<void> {
    const groups = this.loadGroups()
    const groupIndex = groups.findIndex(group => group.name === 'lc')
    if (groupIndex === -1) {
      await this.addGroup('lc')
    }
    await this.process({
      title: `Add user (${user}) To Group (lc)`,
      command: 'usermod',
      args: ['-g', 'lc', quote([user])]
    })
  }

  public async getUsers(): Promise<string[]> {
    const groups = this.loadGroups()
    const lcGroup = groups.find(group => group.name === 'lc')
    if (!lcGroup) {
      await this.addGroup('lc')
      return []
    }
    return lcGroup.users
  }

  public async removeUser(user: string): Promise<void> {
    const groups = this.loadGroups()
    const group = groups.find(g => g.name === 'lc')
    if (group?.users.includes(user)) {
      await this.process({
        title: `Delete user (${user})`,
        command: 'deluser',
        args: [quote([user]), 'lc']
      })
    }
  }
}