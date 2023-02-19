import { User } from 'types/Users'
import { Model } from 'bitis/core'
import { Prefix, Methods, On, Request, Response } from 'bitis/http'
import { UsersModel } from 'models'

const { POST, GET, PUT, DELETE } = Methods

@Prefix('users')
export class UsersController {
  @Model('UsersModel') private usersModel: UsersModel
  @On(POST, '/')
  public async create(req: Request, res: Response) {
    const { name, fullName, email, role, password } = req.body
    await this.usersModel.create({ name, fullName, email, role, password })
    res.status(200).send('Ok!')
  }
  @On(GET, '/')
  public async get(req: Request, res: Response) {
    const { filter } = req.body
    if (filter === 'find' || filter === 'get') {
      const query: Partial<User> = this.buildData(req.body)
      if (filter === 'find') {
        if (Object.keys(query).length === 0) {
          res.json([])
        } else {
          const users = await this.usersModel.find(query)
          res.json(users)
        }
      } else if (filter === 'get') {
        if (Object.keys(query).length === 0) {
          res.json(null)
        } else {
          const users = await this.usersModel.get(query)
          res.json(users)
        }
      } else {
        const results = await this.usersModel.getAll()
        res.json(results)
      }
    } else {
      const results = await this.usersModel.getAll()
      res.json(results)
    }
  }
  @On(PUT, '/')
  public async update(req: Request, res: Response) {
    const where: Partial<User> = this.buildData(req.body.query || {})
    const query: Partial<User> = this.buildData(req.body.data || {})
    if (Object.keys(where).length > 0 && Object.keys(query).length > 0) {
      await this.usersModel.update(query, where)
    }
    res.send('Ok!')
  }
  @On(DELETE, '/')
  public async delete(req: Request, res: Response) {
    const query: Partial<User> = this.buildData(req.body)
    if (Object.keys(query).length > 0) {
      await this.usersModel.delete(query)
    }
    res.send('Ok!')
  }
  private buildData(data: any): Partial<User> {
    const result = {}
    const { uuid, name, fullName, email, role } = data
    if (uuid) {
      result['uuid'] = uuid
    }
    if (name) {
      result['name'] = name
    }
    if (fullName) {
      result['fullName'] = fullName
    }
    if (email) {
      result['email'] = email
    }
    if (role) {
      result['role'] = role
    }
    return result
  }
}