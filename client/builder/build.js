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
  const filePath = [srcDir]
  if (manifest) {
    filePath.push('app')
  }
  filePath.push('main.ts')
  const mainFile = path.join(...filePath)
  await build(getOpts([mainFile], outdir))
  if (manifest) {
    const manifestFilePath = path.join(srcDir, 'manifest.json')
    const manifest = JSON.parse(fs.readFileSync(manifestFilePath, { encoding: 'utf8' }) || '{}')
    const manifestOutFile = path.join(outdir, 'manifest.json')
    fs.writeFileSync(manifestOutFile, JSON.stringify(manifest, null, ''), { encoding: 'utf8' })
    const { services } = manifest
    if (services) {
      const serviceNames = Object.keys(services)
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