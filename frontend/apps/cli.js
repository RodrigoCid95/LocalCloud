const path = require('node:path')
const fs = require('node:fs')
const assert = require('node:assert')
const esbuild = require('esbuild')
const sass = require('sass')
const htmlMinifier = require('html-minifier-terser')
const archiver = require('archiver')

const plugins = [
  {
    name: 'css',
    setup(build) {
      build.onLoad({ filter: /\.scss$/ }, async ({ path }) => {
        const opts = {}
        if (build.initialOptions.minify) {
          opts['style'] = 'compressed'
        }
        const { css } = await sass.compileAsync(path, opts)
        let code = '`\n' + css + '\n`'
        if (build.initialOptions.minify) {
          code = `'${css}'`
        }
        return { contents: `const css = new CSSStyleSheet();css.replaceSync(${code});export default css;`, loader: 'js' }
      })
    }
  },
  {
    name: 'html',
    setup(build) {
      build.onLoad({ filter: /\.html$/ }, async ({ path }) => {
        let html = fs.readFileSync(path, { encoding: 'utf8' })
        if (html !== '' && build.initialOptions.minify) {
          assert(html)
          html = await htmlMinifier.minify(html, {
            removeComments: true,
            removeCommentsFromCDATA: true,
            removeCDATASectionsFromCDATA: true,
            collapseWhitespace: true,
            collapseBooleanAttributes: true,
            removeAttributeQuotes: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeEmptyElements: false,
            removeOptionalTags: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            minifyJS: true,
            minifyCSS: true
          })
        }
        let code = '`\n' + html + '\n`'
        if (build.initialOptions.minify) {
          code = `'${html}'`
        }
        return { contents: `export default ${code}`, loader: 'js' }
      })
    }
  }
]

const callbacks = {
  async start(src) {
    const ctx = await esbuild.context({
      entryPoints: [src],
      outdir: 'www/js',
      bundle: true,
      splitting: true,
      format: 'esm',
      loader: { '.webp': 'dataurl', '.svg': 'dataurl' },
      plugins
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
      plugins,
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
      console.log(archive.pointer() + ' bytes en total!')
      console.log('El paquete de instalación está listo!')
    })
    archive.pipe(output)
    archive.file(manifestPath, { name: 'manifest.json' })
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
  const srcPath = path.resolve(process.cwd(), src, 'main.ts')
  if (!fs.existsSync(src)) {
    console.error(`El directorio "${srcPath} no existe!"`)
    return
  }
  callback(srcPath)
})(process.argv.slice(2))