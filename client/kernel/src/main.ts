const Main = async (mainElement: HTMLElement) => {
  const { default: OS } = await import('./OS')
  const os = new OS(mainElement)
  window.os = os
  console.log('OS =>', os)
  const { Cipher } = await import('./libs/Cipher')
  const { default: Server } = await import('./libs/Server')
  const server = new Server(new Cipher())
  console.log('Server =>', server)
  os.setServer(server)
  window.server = server
}

export default Main