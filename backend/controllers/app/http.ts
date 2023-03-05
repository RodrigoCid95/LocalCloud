import { Model } from 'bitis/core'
import path from 'path'
import { Prefix, Methods, On, Request, Response } from 'bitis/http'
import { AppsModel } from 'models'

const { GET, DELETE } = Methods

@Prefix('app')
export class AppController {
  @Model('AppsModel') private appsModel: AppsModel
  @On(GET, '/:packageName')
  public async manifest(req: Request, res: Response) {
    const { packageName } = req.params
    const { user } = req.session as any
    if (packageName && user) {
      const { uuid } = user
      const result = await this.appsModel.getManifest(packageName, uuid)
      res.json(result)
    } else {
      res.status(404).end()
    }
  }
  @On(GET, '/user/:uuid/:packageName')
  public async manifestByUUID(req: Request, res: Response) {
    const { uuid, packageName } = req.params
    const { user } = req.session as any
    if (uuid && packageName && user?.role === 'admin') {
      const result = await this.appsModel.getManifest(packageName, uuid)
      res.json(result)
    } else {
      res.status(404).end()
    }
  }
  @On(GET, '/:packageName/*')
  public app(req: Request, res: Response) {
    const file = req.params[0]
    const { user } = req.session as any
    if (file && user) {
      const { packageName } = req.params
      const baseDir = this.appsModel.resolveAppDir(packageName, user.uuid)
      const filePath = path.resolve(baseDir, file)
      res.sendFile(filePath)
    } else {
      res.status(404).end()
    }
  }
  @On(DELETE, '/:packageName')
  public async uninstall(req: Request, res: Response) {
    const { user } = req.session as any
    if (!user) {
      res.status(500).send('Inicio de sesión requerido!')
      return
    }
    const { uuid } = user
    const { packageName } = req.params
    try {
      await this.appsModel.uninstall(uuid, packageName)
      res.status(200).end()
    } catch ({ message }) {
      res.status(500).send(message)
    }
  }
  @On(DELETE, '/:uuid/:packageName')
  public async uninstallByUUID(req: Request, res: Response) {
    const { user } = req.session as any
    if (!user) {
      res.status(500).send('Inicio de sesión requerido!')
      return
    }
    if (user.role !== 'admin') {
      res.status(500).send('No tienes permiso para hacer esto!')
      return
    }
    const { uuid, packageName } = req.params
    try {
      await this.appsModel.uninstall(uuid, packageName)
      res.status(200).end()
    } catch ({ message }) {
      res.status(500).send(message)
    }
  }
}