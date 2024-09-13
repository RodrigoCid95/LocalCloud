import fs from 'node:fs'

const { group: groupPath } = configs.get('paths')

export class GroupManager implements GroupManager.Class {
  constructor() {
    if (!fs.existsSync(groupPath)) {
      fs.writeFileSync(groupPath, '', 'utf-8')
    }
  }
  #loadedGroups(): GroupManager.Group[] {
    const content = fs.readFileSync(groupPath, 'utf8')
    const groups: GroupManager.Group[] = content
      .split('\n')
      .filter(line => line !== '')
      .map(line => {
        const [name, _, gid, userList] = line.split(':')
        const users = userList.split(',')
        return { gid: Number(gid), name, users }
      })
    return groups
  }
  #loadGroup() {
  }
  addGroup(name: GroupManager.Group['name']): GroupManager.Group['gid'] {
    const groups = this.#loadedGroups()
    const groupIndex = groups.findIndex(group => group.name === name)
    if (groupIndex === -1) {
      let gid = 1000
      for (const group of groups) {
        if (group.gid.toString().length === 4 && group.gid > gid) {
          gid = group.gid
        }
      }
      gid++
      const newLine = `\n${name}:x:${gid}:`
      fs.appendFileSync(groupPath, newLine, 'utf8')
      return gid
    }
    return groups[groupIndex].gid
  }
  removeGroup(name: GroupManager.Group['name']): void {
    const groups = this.#loadedGroups()
    const groupIndex = groups.findIndex(group => group.name === name)
    if (groupIndex !== -1) {
      groups.splice(groupIndex, 1)
      const newContent = groups
        .map(group => `${group.name}:x:${group.gid}:${group.users.join(',')}`)
        .join('\n')
      fs.writeFileSync(groupPath, newContent, 'utf8')
    }
  }
  addUser(user: string): void {
    const groups = this.#loadedGroups()
    const groupIndex = groups.findIndex(group => group.name === 'lc')
    if (!groups[groupIndex].users.includes(user)) {
      groups[groupIndex].users.push(user)
    }
    const newContent = groups
      .map(group => `${group.name}:x:${group.gid}:${group.users.join(',')}`)
      .join('\n')
    fs.writeFileSync(groupPath, newContent, 'utf8')
  }
  getUsers(): string[] {
    const groups = this.#loadedGroups()
    const lcGoup = groups.find(group => group.name === 'lc')
    if (lcGoup) {
      return lcGoup.users
    }
    this.addGroup('lc')
    return []
  }
  removeUser(user: string): void {
    const groups = this.#loadedGroups()
    const groupIndex = groups.findIndex(group => group.name === 'lc')
    if (groups[groupIndex].users.includes(user)) {
      const userIndex = groups[groupIndex].users.indexOf(user)
      groups[groupIndex].users.splice(userIndex, 1)
    }
    const newContent = groups
      .map(group => `${group.name}:x:${group.gid}:${group.users.join(',')}`)
      .join('\n')
    fs.writeFileSync(groupPath, newContent, 'utf8')
  }
}