const path = require('node:path')
const fs = require('node:fs')
const esbuild = require('esbuild')
const archiver = require('archiver')

const generateAssets = (packageName, forInstaller = false) => {
  const outBaseDir = forInstaller
    ? path.join(process.cwd(), '..', '..', 'installer', 'local-cloud', 'usr', 'share', 'local-cloud', 'apps', packageName)
    : path.join(process.cwd(), 'apps', 'sources', packageName)
  const outViewsBaseDir = forInstaller
    ? path.join(process.cwd(), '..', '..', 'installer', 'local-cloud', 'usr', 'share', 'local-cloud', 'views', 'apps')
    : path.join(process.cwd(), 'apps', 'views')
  if (!fs.existsSync(outBaseDir)) {
    fs.mkdirSync(outBaseDir, { recursive: true })
  }
  if (!fs.existsSync(outViewsBaseDir)) {
    fs.mkdirSync(outViewsBaseDir, { recursive: true })
  }
  const manifestPath = path.join(process.cwd(), packageName, 'manifest.json')
  let manifestContent = fs.readFileSync(manifestPath, 'utf8')
  const manifest = JSON.parse(manifestContent)
  const permissions = {}
  if (manifest.permissions) {
    const keys = Object.keys(manifest.permissions)
    for (const key of keys) {
      permissions[key.toLocaleLowerCase()] = {
        description: manifest.permissions[key],
        enable: true
      }
    }
  }
  manifest.permissions = permissions
  if (manifest.sources) {
    const sourcesKeys = Object.keys(manifest.sources)
    for (const sourcesKey of sourcesKeys) {
      const sourceCollection = manifest.sources[sourcesKey]
      for (let index = 0; index < sourceCollection.length; index++) {
        manifest.sources[sourcesKey][index].enable = true
      }
    }
  } else {
    manifest.sources = {}
  }
  manifestContent = JSON.stringify(manifest)
  fs.writeFileSync(path.join(outBaseDir, 'manifest.json'), manifestContent, 'utf8')
  let template = '{% layout "layout.liquid" %}'
  const headPath = path.join(process.cwd(), packageName, 'head.html')
  if (fs.existsSync(headPath)) {
    const headContent = fs.readFileSync(headPath, 'utf8')
    template += `{% block head %}${headContent}{% endblock %}`
  }
  const bodyPath = path.join(process.cwd(), packageName, 'body.html')
  if (fs.existsSync(bodyPath)) {
    const bodyContent = fs.readFileSync(bodyPath, 'utf8')
    template += `{% block body %}${bodyContent}{% endblock %}`
  }
  const viewPath = path.join(outViewsBaseDir, `${packageName.replace(/\./g, '-')}.liquid`)
  fs.writeFileSync(viewPath, template, 'utf8')
  const codePath = path.join(outBaseDir, 'code')
  return { codePath, viewPath, manifestPath }
}

const callbacks = {
  async start(src, packageName) {
    const { codePath } = generateAssets(packageName, true)
    const ctx = await esbuild.context({
      entryPoints: [src],
      outdir: codePath,
      bundle: true,
      splitting: true,
      format: 'esm',
      loader: { '.webp': 'dataurl', '.svg': 'dataurl', '.tsx': 'tsx', '.ts': 'ts' },
      sourcemap: true
    })
    await ctx.watch()
    console.log('Observando ...')
  },
  async publish(src, packageName) {
    const { codePath, viewPath, manifestPath } = generateAssets(packageName)
    await esbuild.build({
      entryPoints: [src],
      outdir: codePath,
      bundle: true,
      splitting: true,
      format: 'esm',
      loader: { '.webp': 'dataurl', '.svg': 'dataurl' },
      minify: true
    })
    const distDir = path.join(process.cwd(), 'dist')
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true })
    }
    const zipperPath = path.join(distDir, `${packageName}.zip`)
    const output = fs.createWriteStream(zipperPath)
    const archive = archiver('zip', { zlib: { level: 0 } })
    output.on('close', () => {
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
    archive.file(viewPath, { name: path.basename(viewPath) })
    archive.file(manifestPath, { name: 'manifest.json' })
    archive.directory(codePath, 'code')
    archive.finalize()
  },
  async build(src, packageName) {
    const { codePath } = generateAssets(packageName, true)
    await esbuild.build({
      entryPoints: [src],
      outdir: codePath,
      bundle: true,
      splitting: true,
      format: 'esm',
      loader: { '.webp': 'dataurl', '.svg': 'dataurl' },
      minify: true
    })
  }
};

(([command, packageName]) => {
  if (!command) {
    console.error('No se definió una tarea.')
    return
  }
  const callback = callbacks[command]
  if (!callback) {
    console.error(`El comando ${command} no existe!`)
    return
  }
  if (!packageName) {
    console.error('No se definió un nombre de paquete.')
    return
  }
  const srcPath = path.resolve(process.cwd(), packageName, 'main.tsx')
  if (!fs.existsSync(packageName)) {
    console.error(`El directorio "${srcPath} no existe!"`)
    return
  }
  callback(srcPath, packageName)
})(process.argv.slice(2))