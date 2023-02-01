const plugins = require('./plugins')
const path = require('path')
const fs = require('fs')

module.exports = async (args) => {
  const prod = args['prod']
  const service = typeof args['service'] === 'boolean' ? false : args['service']
  const srcDir = path.resolve('.', 'src', 'services', service)
  const entryPoint = path.join(srcDir, 'index.ts')
  if (!fs.existsSync(entryPoint)) {
    console.error(`No se encontró el servicio ${service}!`)
    return
  }
  const outdir = path.resolve('.', '..', 'backend', 'public', 'js', 'services', service)
  if (fs.existsSync(outdir)) {
    fs.rmSync(outdir, { recursive: true, force: true })
  }
  const iconDir = path.join(srcDir, 'icon.webp')
  const localIconDir = path.resolve(__dirname, 'app.webp')
  const srcIcon = fs.existsSync(iconDir) ? iconDir : localIconDir
  const iconResult = fs.readFileSync(srcIcon, { encoding: 'base64' })
  const icon = `data:image/webp;base64,${iconResult}`
  const defaultManifest = {
    title: 'Example service!',
    name: service,
    description: 'Service description',
    author: [],
    services: []
  }
  const manifestResult = JSON.parse(fs.readFileSync(path.join(srcDir, 'manifest.json'), { encoding: 'utf8' }))
  const manifest = {
    icon,
    title: manifestResult.title || defaultManifest.title,
    description: manifestResult.description || defaultManifest.description,
    author: manifestResult.author || defaultManifest.author,
    services: manifestResult.services || defaultManifest.services,
    type: 'service'
  }
  require('esbuild').build({
    entryPoints: [entryPoint],
    outdir,
    bundle: true,
    format: 'esm',
    splitting: true,
    sourcemap: !prod,
    plugins,
    minify: prod,
    watch: !prod ?? {
      onRebuild(error, result) {
        if (error) console.error('Error:', error)
        else console.log('Compilado:', result)
      },
    },
    loader: { '.webp': 'dataurl' }
  }).then(() => {
    const content = prod ? JSON.stringify(manifest) : JSON.stringify(manifest, null, '\t')
    const manifestsPath = path.resolve('.', '..', 'backend', 'manifests')
  if (!fs.existsSync(manifestsPath)) {
    fs.mkdirSync(manifestsPath)
  }
  fs.writeFileSync(path.join(manifestsPath, `${service}.json`), content, { encoding: 'utf8' })
    console.log('Listo!')
  })
}