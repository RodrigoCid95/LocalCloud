import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import busboy from 'busboy'

const verifySetup: PXIOHTTP.Middleware = (_: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response, next: Next): void => {
  if (SETUP) {
    next()
  } else {
    res.status(404).end()
  }
}

@Namespace('setup')
@Middlewares({ before: [verifySetup] })
export class SetupController {
  @Model('SetupModel') private model: Models<'SetupModel'>
  @Model('AppsModel') private appsModel: Models<'AppsModel'>
  @Model('UsersModel') private usersModel: Models<'UsersModel'>

  @Post('/user')
  public user(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    const { name } = req.body
    const result = this.model
      .getUsers()
      .map(({ name, isUserSystem }) => ({ name, isUserSystem }))
      .find((user) => user.name === name)
    if (result) {
      if (result.isUserSystem) {
        res.json({ ok: false })
      } else {
        res.json({ ok: true, existent: true })
      }
    } else {
      res.json({ ok: true, existent: false })
    }
  }

  @Put('/user')
  public async createUser(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): Promise<void> {
    const { name, password } = req.body
    const result = this.model
      .getUsers()
      .find((user) => user.name === name)
    if (result) {
      const verify = this.model.verifyPassword(result.password_hash, password)
      if (verify) {
        this.model.addToGroup(name)
        res.json({ ok: true, uid: result.uid })
      } else {
        res.json({ ok: false })
      }
    } else {
      const uid = await this.model.createUser(name, password)
      res.json({ ok: true, uid })
    }
  }

  @Put('/apps')
  public install(req: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    let uid: number = NaN
    const loads = {}
    const bb = busboy({ headers: req.headers })
    bb
      .on('field', (name, val) => {
        if (name === 'uid') {
          uid = Number(val)
        }
      })
      .on('file', (name, file, info) => {
        const { filename, mimeType } = info
        if (['application/zip', 'application/x-zip-compressed'].includes(mimeType)) {
          const stream = fs.createWriteStream(path.join(this.appsModel.paths.apps, 'temp', crypto.randomUUID()))
          file
            .on('data', data => stream.write(data))
            .on('error', () => stream.close(() => fs.unlinkSync(stream.path)))
            .on('end', () => {
              loads[name] = {
                path: stream.path,
                filename
              }
              stream.close()
            })
        } else {
          file
            .on('data', () => { })
            .on('error', () => { })
            .on('end', () => {
              loads[name] = {
                code: 'invalid-file',
                message: 'El archivo no es válido.'
              }
            })
        }
      })
      .on('finish', async () => {
        const results = {}
        if (!isNaN(uid)) {
          const entries = Object.entries<any>(loads)
          for (const [key, value] of entries) {
            if (value.code) {
              results[key] = value
            } else {
              const update = req.query.update !== undefined
              if (!update) {
                const possibleApp = await this.appsModel.getAppByPackageName(key)
                if (possibleApp) {
                  results[key] = {
                    ok: false,
                    message: 'La aplicación ya está instalada.'
                  }
                  continue
                }
              }
              const result = await this.appsModel.install(key, value.path, update)
              if (result === true) {
                await this.usersModel.assignApp(uid, key)
                results[key] = { ok: true }
              } else {
                if (result === 'manifest-author-required') {
                  results[key] = {
                    ok: false,
                    message: `El paquete ${value.filename} no cuenta con un autor.`
                  }
                }
                if (result === 'manifest-invalid') {
                  results[key] = {
                    ok: false,
                    message: `El paquete ${value.filename} no cuenta con un manifest válido.`
                  }
                }
                if (result === 'manifest-not-exist') {
                  results[key] = {
                    ok: false,
                    message: `El paquete ${value.filename} no cuenta con un manifest.`
                  }
                }
                if (result === 'manifest-title-required') {
                  results[key] = {
                    ok: false,
                    message: `El paquete ${value.filename} no cuenta con un título.`
                  }
                }
              }
            }
            if (value.path) {
              fs.unlinkSync(value.path)
            }
          }
        }
        res.json(results)
      })
    req.pipe(bb)
  }

  @Post('/reboot')
  public reboot(_: PXIOHTTP.Request<LocalCloud.SessionData>, res: PXIOHTTP.Response): void {
    res.json({ ok: true })
    this.model.reboot()
  }
}