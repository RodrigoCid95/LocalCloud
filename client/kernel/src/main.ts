import template from './template.html'

const Main = async (mainElement: HTMLElement) => {
  mainElement.innerHTML = template
  const { default: OS } = await import('./lib/OS')
  const os = new OS(mainElement)
  window.os = os
  console.log('OS =>', os)
  const { default: Server } = await import('./lib/Server')
  const server = new Server()
  console.log('Server =>', server)
  os.server = server
  window.server = server
}

export default Main