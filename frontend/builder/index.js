(argv => {
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
  const kernel = args['kernel'] !== undefined
  const app = args['app'] !== undefined
  const service = args['service'] !== undefined
  let src = ''
  if (kernel) {
    src = 'kernel'
  }
  if (app) {
    src = 'app'
  }
  if (service) {
    src = 'service'
  }
  if (src !== '') {
    require(`./${src}.js`)(args)
  }
})(process.argv.slice(2))