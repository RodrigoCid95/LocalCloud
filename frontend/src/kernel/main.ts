import Server from './lib/Server'
import OS from './lib/OS'

const Main = (mainElement: HTMLElement) => {
  const server = new Server()
  const os = new OS(mainElement, server)
  console.log('OS =>', os)
}

export default Main