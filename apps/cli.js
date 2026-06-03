const path = require('node:path')
const fs = require('node:fs')
const esbuild = require('esbuild')
const archiver = require('archiver')

const loaders = { '.webp': 'dataurl', '.svg': 'dataurl', '.wav': 'dataurl', '.tsx': 'tsx', '.ts': 'ts' }
const staticAssetPattern = /(^|[-.])worker\.js$/i

const copyStaticAssets = (baseDir, outputDir) => {
  const entries = fs.readdirSync(baseDir, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isFile() || !staticAssetPattern.test(entry.name)) {
      continue
    }

    fs.copyFileSync(path.join(baseDir, entry.name), path.join(outputDir, entry.name))
  }
}

const processManfest = (input, output) => {
  const manifestCotnent = fs.readFileSync(input, 'utf8')
  const manifest = JSON.parse(manifestCotnent)

  const permissions = {}
  const permissionsEntries = Object.entries(manifest.permissions || {})
  for (const [key, value] of permissionsEntries) {
    permissions[key] = {
      description: value,
      enable: true,
    }
  }

  const sources = {}
  const sourcesEntries = Object.entries(manifest.sources || {})
  for (const [type, source] of sourcesEntries) {
    if (sources[type] == undefined) {
      sources[type] = []
    }
    const sourceEntries = Object.entries(source)
    let id = 1
    for (const [url, description] of sourceEntries) {
      sources[type].push({ id, url, description, enable: true })
      id++
    }
  }

  const newManifest = {
    title: manifest.title || '',
    description: manifest.description || '',
    author: manifest.author || '',
    extentions: manifest.extentions || [],
    permissions,
    sources,
  }

  fs.writeFileSync(output, JSON.stringify(newManifest), 'utf8')
}

const generateAssets = (packageName, isSystem = false, processAsinstalled = false) => {
  const baseDir = path.join(process.cwd(), packageName)
  const inHeadTemplate = path.join(baseDir, 'head.html')
  const inBodyTemplate = path.join(baseDir, 'body.html')
  const inFooterTemplate = path.join(baseDir, 'footer.html')
  const inManifestPath = path.join(baseDir, 'manifest.json')

  const outBaseDir = path.join(process.cwd(), '..', 'temp', isSystem ? 'system' : 'apps', packageName)
  const outCodeDir = path.join(outBaseDir, 'code')
  const outViewsBaseDir = path.join(outBaseDir, 'views')
  const outHeadTemplate = path.join(outViewsBaseDir, 'head.html')
  const outBodyTemplate = path.join(outViewsBaseDir, 'body.html')
  const outFooterTemplate = path.join(outViewsBaseDir, 'footer.html')
  const outManifestPath = path.join(outBaseDir, 'manifest.json')

  if (!fs.existsSync(outBaseDir)) {
    fs.mkdirSync(outBaseDir, { recursive: true })
  }

  if (!fs.existsSync(outCodeDir)) {
    fs.mkdirSync(outCodeDir, { recursive: true })
  }

  if (!fs.existsSync(outViewsBaseDir)) {
    fs.mkdirSync(outViewsBaseDir, { recursive: true })
  }

  if (processAsinstalled) {
    processManfest(inManifestPath, outManifestPath)
  } else {
    fs.copyFileSync(inManifestPath, outManifestPath)
  }


  if (fs.existsSync(inHeadTemplate)) {
    fs.copyFileSync(inHeadTemplate, outHeadTemplate)
  } else {
    fs.writeFileSync(outHeadTemplate, '', { encoding: 'utf8' })
  }

  if (fs.existsSync(inBodyTemplate)) {
    fs.copyFileSync(inBodyTemplate, outBodyTemplate)
  } else {
    fs.writeFileSync(outBodyTemplate, '', { encoding: 'utf8' })
  }

  if (fs.existsSync(inFooterTemplate)) {
    fs.copyFileSync(inFooterTemplate, outFooterTemplate)
  } else {
    fs.writeFileSync(outFooterTemplate, '', { encoding: 'utf8' })
  }

  copyStaticAssets(baseDir, outCodeDir)

  return { codePath: outCodeDir, viewsPath: outViewsBaseDir, manifestPath: outManifestPath }
}

const callbacks = {
  async start(src, packageName, isSystem) {
    const { codePath } = generateAssets(packageName, isSystem, true)
    const ctx = await esbuild.context({
      entryPoints: [src],
      outdir: codePath,
      bundle: true,
      splitting: true,
      format: 'esm',
      loader: loaders,
      sourcemap: true
    })
    await ctx.watch()
    console.log('Observando ...')
  },
  async publish(src, packageName, isSystem) {
    const { codePath, viewsPath, manifestPath } = generateAssets(packageName, isSystem)
    await esbuild.build({
      entryPoints: [src],
      outdir: codePath,
      bundle: true,
      splitting: true,
      format: 'esm',
      loader: loaders,
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
      fs.rmSync(path.resolve(codePath, '..'), { recursive: true })
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
    archive.directory(viewsPath, 'views')
    archive.directory(codePath, 'code')
    archive.finalize()
  },
  async build(src, packageName, isSystem) {
    const isDev = process.argv.includes('dev')
    const { codePath } = generateAssets(packageName, isSystem, isDev)
    await esbuild.build({
      entryPoints: [src],
      outdir: codePath,
      bundle: true,
      splitting: true,
      format: 'esm',
      loader: loaders,
      minify: !isDev,
      sourcemap: isDev
    })
  }
};

(([command, packageName, isSystem = '0']) => {
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
  const baseDir = path.resolve(process.cwd(), packageName)
  const mainPath = path.join(baseDir, 'main.ts')
  if (!fs.existsSync(baseDir)) {
    console.error(`El directorio "${srcPath} no existe!"`)
    return
  }

  if (!fs.existsSync(mainPath)) {
    console.error(`El archivo "${mainPath} no existe!"`)
    return
  }
  callback(mainPath, packageName, isSystem == '1')
})(process.argv.slice(2))
