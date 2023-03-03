const path = require('path')
const fs = require('fs')
const { context } = require('esbuild')
const plugins = require('./plugins')

const getOpts = (entryPoints, outdir) => ({
  entryPoints,
  outdir,
  bundle: true,
  format: 'esm',
  splitting: true,
  sourcemap: true,
  plugins,
  minify: false,
  loader: { '.webp': 'dataurl', '.svg': 'dataurl' }
})

module.exports = async ({ input, output, manifest }) => {
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
  const ctxList = [context(getOpts([mainFile], outdir))]
  if (manifest) {
    const manifestFilePath = path.join(srcDir, 'manifest.json')
    const manifestData = JSON.parse(fs.readFileSync(manifestFilePath, { encoding: 'utf8' }) || '{}')
    const { services } = manifestData
    if (services) {
      const serviceNames = Object.keys(services)
      for (const nameService of serviceNames) {
        const serviceSrcDir = path.join(srcDir, 'services', `${nameService}.ts`)
        const serviceOutDir = path.join(outdir, 'services')
        ctxList.push(context(getOpts([serviceSrcDir], serviceOutDir)))
      }
    }
  }
  const buildInstances = await Promise.all(ctxList)
  await Promise.all(buildInstances.map(ctx => ctx.watch()))
  console.log('Listo!')
  process.on('exit', async () => {
    for (const ctx of buildInstances) {
      await ctx.dispose()
    }
  })
}