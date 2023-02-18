import { User } from 'types/Users'
import { Model } from 'bitis/core'
import { Prefix, Methods, On, Request, Response } from 'bitis/http'
import { AppsModel } from 'models'

const { GET, POST, DELETE } = Methods

@Prefix('apps-manager')
export class AppsController {
  @Model('AppsModel') private appsModel: AppsModel
  @On(POST, '/')
  public async install(req: Request, res: Response) {
    const files: any = (req as any).files
    const user: User | null = (req.session as any).user
    if (!user) {
      res.status(500).send('Inicio de sesión requerido!')
      return
    }
    if (!files.installer) {
      res.status(500).send('Falta el instalador!')
      return
    }
    let { name, data, mimetype } = files.installer
    if (mimetype === 'application/zip') {
      try {
        await this.appsModel.install(user.uuid, (name as string).replace('.zip', ''), data)
        res.status(200).end()
      } catch (error) {
        res.status(500).send(error.message)
      }
    } else {
      res.status(500).send('El archivo adjunto no es un comprimido!')
    }
  }
  @On(POST, '/:uuid')
  public async installByUUID(req: Request, res: Response) {
    const files: any = (req as any).files
    const user: User | null = (req.session as any).user
    if (!user) {
      res.status(500).send('Inicio de sesión requerido!')
      return
    }
    if (user.role !== 'admin') {
      res.status(500).send('No tienes permiso para hacer esto!')
      return
    }
    if (!files.installer) {
      res.status(500).send('Falta el instalador!')
      return
    }
    let { name, data, mimetype } = files.installer
    if (mimetype === 'application/zip') {
      try {
        const { uuid } = req.params
        await this.appsModel.install(uuid, (name as string).replace('.zip', ''), data)
        res.status(200).end()
      } catch (error) {
        res.status(500).send(error.message)
      }
    } else {
      res.status(500).send('El archivo adjunto no es un comprimido!')
    }
  }
  @On(GET, '/user/:uuid/manifest/:packageName')
  public async getManifestByUUID(req: Request, res: Response) {
    const { user } = req.session as any
    if (user && user.role === 'admin') {
      const { uuid, packageName } = req.params
      const result = await this.appsModel.getManifest(packageName, uuid)
      res.json(result)
    } else {
      res.status(404).end()
    }
  }
  @On(GET, '/user/manifest/:packageName')
  public async getManifest(req: Request, res: Response) {
    const { user } = req.session as any
    if (user) {
      const { uuid } = user
      const { packageName } = req.params
      const result = await this.appsModel.getManifest(packageName, uuid)
      res.json(result)
    } else {
      res.status(404).end()
    }
  }
  @On(GET, '/system/manifest/:packageName')
  public async getSystemManifest(req: Request, res: Response) {
    const { packageName } = req.params
    const result = await this.appsModel.getManifest(packageName)
    res.json(result)
  }
  @On(GET, '/manifests')
  public async getManifests(req: Request, res: Response) {
    const { user }: { user: User | null } = req.session as any
    if (user) {
      const results = await this.appsModel.getManifests(user.uuid)
      res.json(results)
    } else {
      res.status(404).end()
    }
  }
  @On(GET, '/:uuid/manifests')
  public async getManifestsByUUID(req: Request, res: Response) {
    const { user }: { user: User | null } = req.session as any
    if (user?.role === 'admin') {
      const { uuid } = req.params
      const results = await this.appsModel.getManifests(uuid)
      res.json(results)
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