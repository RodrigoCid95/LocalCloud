const plugins = require('./plugins')
const path = require('path')
const fs = require('fs')

module.exports = (args) => {
  const prod = args['prod']
  const outdir = path.resolve('.', '..', 'backend', 'public', 'js', 'kernel')
  if (fs.existsSync(outdir)) {
    fs.rmSync(outdir, { recursive: true, force: true })
  }
  const opts = {
    entryPoints: [path.resolve('.', 'src', 'kernel', 'main.ts')],
    outdir,
    bundle: true,
    format: 'esm',
    splitting: true,
    sourcemap: !prod,
    plugins,
    minify: prod,
    loader: { '.webp': 'dataurl' }
  }
  if (!prod) {
    opts['watch'] = {
      onRebuild(error, result) {
        if (error) console.error('Error:', error)
        else console.log('Compilado:', result.warnings)
      },
    }
  }
  require('esbuild').build(opts).then(() => console.log('Listo!'))
}