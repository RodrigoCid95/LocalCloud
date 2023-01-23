((argv) => {
  const args = {}
  let a
  let opt
  let thisOpt
  let curOpt
  for (a = 0; a < argv.length; a++) {
    thisOpt = argv[a].trim()
    opt = thisOpt.replace(/^\-+/, '')
    if (opt === thisOpt) {
      if (curOpt) args[curOpt] = opt
      curOpt = null
    } else {
      curOpt = opt
      args[curOpt] = true
    }
  }
  const src = args['src']
  const prod = args['prod'] !== undefined
  const app = args['app']
  let keep = false
  if (src !== 'apps') {
    keep = true
  } else {
    if (app && typeof app === 'string') {
      keep = true
    }
  }
  if (keep) {
    const path = require('path')
    const entryPoints = []
    if (src !== 'apps') {
      entryPoints.push(path.resolve('.', 'src', src, 'main.ts'))
    } else {
      entryPoints.push(path.resolve('.', 'src', src, app, 'main.ts'))
    }
    let outdir
    if (src !== 'apps') {
      outdir = path.resolve('.', '..', 'backend', 'public', 'js', src)
    } else {
      outdir = path.resolve('.', '..', 'backend', 'public', 'js', src, app)
    }
    const sass = require('sass')
    const fs = require('fs')
    const assert = require('assert')
    const htmlMinifier = require('html-minifier-terser')
    fs.rmSync(outdir, { recursive: true, force: true })
    require('esbuild').build({
      entryPoints,
      outdir,
      bundle: true,
      format: 'esm',
      splitting: true,
      sourcemap: !prod,
      plugins: [
        {
          name: 'css',
          setup(build) {
            build.onLoad({ filter: /\.scss$/ }, async ({ path }) => {
              const opts = {}
              if (prod) {
                opts['style'] = 'compressed'
              }
              const { css } = await sass.compileAsync(path, opts)
              let code = '`\n' + css + '\n`'
              if (prod) {
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
              if (html !== '' && prod) {
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
              if (prod) {
                code = `'${html}'`
              }
              return { contents: `export default ${code}`, loader: 'js' }
            })
          }
        }
      ],
      minify: prod,
      watch: !prod ?? {
        onRebuild(error, result) {
          if (error) console.error('Error:', error)
          else console.log('Compilado:', result)
        },
      },
      loader: { '.webp': 'dataurl' }
    }).then(() => console.log('Listo!'))
  }
})(process.argv.slice(2))