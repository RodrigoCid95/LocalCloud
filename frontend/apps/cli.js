const path = require('node:path')
const fs = require('node:fs')
const esbuild = require('esbuild')
const archiver = require('archiver')

const callbacks = {
  async start(src) {
    const ctx = await esbuild.context({
      entryPoints: [src],
      outdir: 'www/js',
      bundle: true,
      splitting: true,
      format: 'esm',
      loader: { '.webp': 'dataurl', '.svg': 'dataurl', '.tsx': 'tsx', '.ts': 'ts' },
      sourcemap: true
    })
    const { port } = await ctx.serve({
      servedir: 'www'
    })
    console.log(`http://localhost:${port}`)
  },
  async build(src) {
    const basedir = path.resolve(src, '..')
    const package_name = path.basename(basedir)
    const distDir = path.join(basedir, '..', 'dist', package_name)
    const codePath = path.join(distDir, 'code')
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true })
    }
    await esbuild.build({
      entryPoints: [src],
      outdir: codePath,
      bundle: true,
      splitting: true,
      format: 'esm',
      loader: { '.webp': 'dataurl', '.svg': 'dataurl' },
      minify: true
    })
    const manifestPath = path.join(basedir, 'manifest.json')
    if (!fs.existsSync(manifestPath)) {
      fs.writeFileSync(manifestPath, '{}', { encoding: 'utf-8' })
    }
    const zipperPath = path.join(distDir, '..', `${package_name}.zip`)
    const output = fs.createWriteStream(zipperPath)
    const archive = archiver('zip', { zlib: { level: 9 } })
    output.on('close', () => {
      fs.rmSync(distDir, { force: true, recursive: true })
      const format = bytes => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const unidades = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + unidades[i]
      }
      console.log(`${format(archive.pointer())} en total!`)
      console.log('El paquete de instalación está listo!')
    })
    archive.pipe(output)
    archive.file(manifestPath, { name: 'manifest.json' })
    const headLayout = path.join(basedir, 'head.html')
    if (fs.existsSync(headLayout)) {
      archive.file(headLayout, { name: 'head.html' })
    }
    const bodyLayout = path.join(basedir, 'body.html')
    if (fs.existsSync(bodyLayout)) {
      archive.file(bodyLayout, { name: 'body.html' })
    }
    archive.directory(codePath, 'code')
    archive.finalize()
  }
};

(([command, src]) => {
  if (!command) {
    console.error('No se definió una tarea.')
    return
  }
  const callback = callbacks[command]
  if (!callback) {
    console.error(`El comando ${command} no existe!`)
    return
  }
  if (!src) {
    console.error('No se definió una fuente.')
    return
  }
  const srcPath = path.resolve(process.cwd(), src, 'main.tsx')
  if (!fs.existsSync(src)) {
    console.error(`El directorio "${srcPath} no existe!"`)
    return
  }
  fs.rmSync(path.join(__dirname, 'www', 'js'), { recursive: true, force: true })
  callback(srcPath)
})(process.argv.slice(2))