const plugins = require('./plugins')
const path = require('path')
const fs = require('fs')

module.exports = async (args) => {
  const prod = args['prod']
  const app = typeof args['app'] === 'boolean' ? false : args['app']
  const srcDir = path.resolve('.', 'src', 'apps', app)
  const entryPoint = path.join(srcDir, 'app', 'index.ts')
  if (!fs.existsSync(entryPoint)) {
    console.error(`No se encontró la app ${app}!`)
    return
  }
  const outdir = path.resolve('.', '..', 'apps', app)
  if (fs.existsSync(outdir)) {
    fs.rmSync(outdir, { recursive: true, force: true })
  }
  const iconDir = path.join(srcDir, 'icon.webp')
  const localIconDir = path.resolve(__dirname, 'app.webp')
  const srcIcon = fs.existsSync(iconDir) ? iconDir : localIconDir
  const iconResult = fs.readFileSync(srcIcon, { encoding: 'base64' })
  const icon = `data:image/webp;base64,${iconResult}`
  const defaultManifest = {
    title: 'Example app!',
    description: 'App description.',
    author: [],
    tag: 'app-example',
    services: {},
    type: 'app'
  }
  const defaultServiceManifest = {
    title: 'Example service!',
    description: 'Service description',
    author: []
  }
  const manifestResult = JSON.parse(fs.readFileSync(path.join(srcDir, 'manifest.json'), { encoding: 'utf8' }))
  const manifest = {
    icon,
    title: manifestResult.title || defaultManifest.title,
    description: manifestResult.description || defaultManifest.description,
    author: manifestResult.author || defaultManifest.author,
    tag: manifestResult.tag || defaultManifest.tag,
    services: manifestResult.services || defaultManifest.services,
    type: manifestResult.type || defaultManifest.type
  }
  for (const key in manifest.services) {
    if (Object.hasOwnProperty.call(manifest.services, key)) {
      const service = manifest.services[key]
      manifest.services[key] = {
        title: service.title || defaultServiceManifest.title,
        description: service.description || defaultServiceManifest.description,
        author: service.author || manifest.author || defaultServiceManifest.author
      }
    }
  }
  const buildOpts = {
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
    loader: { '.webp': 'dataurl', '.svg': 'text' }
  }
  await require('esbuild').build({
    entryPoints: [entryPoint],
    outdir,
    ...buildOpts
  })
  for (const key in manifest.services) {
    if (Object.hasOwnProperty.call(manifest.services, key)) {
      const entryPointService = path.join(srcDir, 'services', `${key}.ts`)
      const outdirService = path.join(outdir, 'services')
      await require('esbuild').build({
        entryPoints: [entryPointService],
        outdir: outdirService,
        ...buildOpts
      })
    }
  }
  /* const content = prod ? JSON.stringify(manifest) : JSON.stringify(manifest, null, '\t')
  const manifestsPath = path.resolve('.', '..', 'backend', 'manifests')
  if (!fs.existsSync(manifestsPath)) {
    fs.mkdirSync(manifestsPath)
  }
  fs.writeFileSync(path.join(manifestsPath, `${app}.json`), content, { encoding: 'utf8' }) */
  console.log('Listo!')
}