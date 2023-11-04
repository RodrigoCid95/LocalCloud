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
  loader: { '.webp': 'dataurl', '.svg': 'dataurl' },
  target: ['es2017']
})

module.exports = async ({ input, output, manifest }) => {
  const ctxList = []
  if (fs.existsSync(output)) {
    fs.rmSync(output, { force: true, recursive: true })
  }
  const mainFile = path.join(input, 'main.ts')
  ctxList.push(context(getOpts([mainFile], output)))
  const buildInstances = await Promise.all(ctxList)
  await Promise.all(buildInstances.map(ctx => ctx.watch()))
  console.log('Listo!')
  process.on('exit', async () => {
    for (const ctx of buildInstances) {
      await ctx.dispose()
    }
  })
}