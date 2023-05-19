const path = require('path')
const fs = require('fs')
const { build } = require('esbuild')
const plugins = require('./plugins')

const getOpts = (entryPoints, outdir) => ({
  entryPoints,
  outdir,
  bundle: true,
  format: 'esm',
  splitting: true,
  sourcemap: false,
  plugins,
  minify: true,
  loader: { '.webp': 'dataurl', '.svg': 'dataurl' }
})

module.exports = async ({ input, output, manifest, zipper }) => {
  const srcDir = path.resolve(process.cwd(), input)
  const outdir = path.resolve(process.cwd(), output)
  if (fs.existsSync(outdir)) {
    fs.rmSync(outdir, { force: true, recursive: true })
  }
  const mainAppPath = path.join(input, 'main.ts')
  await build(getOpts([mainAppPath], outdir))
  if (manifest) {
    const packageName = path.basename(srcDir)
    if (!/^[a-zA-Z]+(\.[a-zA-Z]+)*$/.test(packageName)) {
      console.log('El nómbre del paquete no es válido!')
      return
    }
    const manifestFilePath = path.join(srcDir, 'manifest.json')
    const {
      title = packageName,
      description = '',
      author = [],
      icon = "data:image/svg+xml,%3Csvg viewBox='0 0 48 32' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='48' height='32' style='stroke-width: 4px%3B stroke: rgb(255  255  255)%3B fill: rgba(255  255  255  0)%3B' rx='4' ry='4' transform='matrix(-1  0  0  -1  0  0)' x='-48' y='-32'%3E%3C/rect%3E%3Cline style='stroke-width: 4px%3B fill: rgb(216  216  216)%3B stroke: rgb(255  255  255)%3B' x1='0' y1='8' x2='48' y2='8'%3E%3C/line%3E%3C/svg%3E",
      services = {},
      type = 'app'
    } = JSON.parse(fs.readFileSync(manifestFilePath, { encoding: 'utf8' }) || '{}')
    const manifestData = { title, description, author, icon, services, type }
    const manifestOutFile = path.join(outdir, 'manifest.json')
    fs.writeFileSync(manifestOutFile, JSON.stringify(manifestData, null, ''), { encoding: 'utf8' })
    const { services: serviceList } = manifestData
    if (services) {
      const serviceNames = Object.keys(serviceList)
      for (const nameService of serviceNames) {
        const serviceSrcDir = path.join(srcDir, 'services', `${nameService}.ts`)
        const serviceOutDir = path.join(outdir, 'services')
        await build(getOpts([serviceSrcDir], serviceOutDir))
      }
    }
  }
  if (zipper) {
    const listFilesInDirectory = (directory) => {
      const files = fs.readdirSync(directory)
      const fileList = []
      for (const file of files) {
        const filePath = path.join(directory, file)
        if (fs.statSync(filePath).isDirectory()) {
          const newFileList = listFilesInDirectory(filePath)
          for (const item of newFileList) {
            fileList.push(item)
          }
        } else {
          fileList.push(filePath)
        }
      }
      return fileList
    }
    const filePathList = listFilesInDirectory(outdir).map(filePath => {
      const result = [filePath]
      result.push(filePath.replace(outdir, ''))
      return result
    })
    const output = fs.createWriteStream(`${outdir}.zip`)
    const archiver = require('archiver')
    const archive = archiver('zip')
    output.on('close', function () {
      console.log(archive.pointer() + ' bytes en total!')
      console.log('El archivador se ha finalizado y el descriptor del archivo de salida se ha cerrado.')
    })
    output.on('end', function () {
      console.log('Los datos han sido drenados')
    })
    archive.on('warning', function (err) {
      if (err.code === 'ENOENT') {
        console.warn(err)
      } else {
        throw err
      }
    })
    archive.on('error', function (err) {
      throw err
    })
    archive.pipe(output)
    for (const [filePath, file] of filePathList) {
      archive.file(filePath, { name: file })
    }
    await archive.finalize()
    fs.rmSync(outdir, { recursive: true, force: true })
  }
}