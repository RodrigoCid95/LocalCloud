const loadCore = async () => {
  const { defineCustomElements } = await import('./ionic')
  await defineCustomElements()
  const { ServerController } = await import('./server')
  Object.defineProperty(window, 'server', { value: new ServerController(), writable: false })
}

Object.defineProperty(window, 'loadCore', { value: loadCore, writable: false })