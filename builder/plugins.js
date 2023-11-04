const sass = require('sass')
const postcss = require('postcss')
const autoprefixer = require('autoprefixer')
const postcssNested = require('postcss-nested')
const fs = require('fs')
const assert = require('assert')
const htmlMinifier = require('html-minifier-terser')
const UglifyCSS = require('uglifycss')

module.exports = [
  {
    name: 'sass',
    setup(build) {
      build.onLoad({ filter: /\.scss$/ }, async ({ path }) => {
        const opts = {}
        if (build.initialOptions.minify) {
          opts['style'] = 'compressed'
        }
        const { css } = sass.compile(path, opts)
        const code = (await postcss([autoprefixer, postcssNested]).process(css, { from: path })).css.replace(/`/gi, "'")
        return { contents: `const css = new CSSStyleSheet();css.replaceSync(\`${code}\`);export default css;`, loader: 'js' }
      })
    }
  },
  {
    name: 'css',
    setup(build) {
      build.onLoad({ filter: /\.css$/ }, async ({ path }) => {
        const css = fs.readFileSync(path, { encoding: 'utf8' })
        let code = (await postcss([autoprefixer, postcssNested]).process(css, { from: path })).css.replace(/`/gi, "'")
        if (build.initialOptions.minify) {
          code = UglifyCSS.processString(code)
        }
        return { contents: `const css = new CSSStyleSheet();css.replaceSync(\`${code}\`);export default css;`, loader: 'js' }
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