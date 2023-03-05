import { IOS } from 'builder'
import OS from './OS'

const Main = async (mainElement: HTMLElement) => {
  const { Cipher } = await import('./libs/Cipher')
  const { default: Server } = await import('./libs/Server')
  const server = new Server(new Cipher())
  console.log('Server =>', server)
  window.server = server
  const { default: defineLogin } = await import('./components/login')
  defineLogin(server)
  mainElement.innerHTML = '<app-login></app-login>'
  let OSClass: typeof OS | undefined
  server.on<Boolean>('auth/change', async auth => {
    let os: IOS | undefined
    mainElement.innerHTML = ''
    if (auth) {
      const loading = await window.loadingController.create({ message: 'Cargando escritorio ...' })
      await loading.present()
      if (!OSClass) {
        OSClass = (await import('./OS')).default
      }
      os = new OSClass(mainElement, server)
      window.os = os
      console.log('OS =>', os)
      if (!window.customElements.get('app-desktop')) {
        const { default: callback } = await import('./components/desktop')
        await callback(server, os.launch.bind(os))
      }
      const appDesktop = document.createElement('app-desktop')
      mainElement.append(appDesktop)
      appDesktop.addEventListener('onReady', () => loading.dismiss())
    } else {
      os = undefined
      mainElement.innerHTML = '<app-login></app-login>'
    }
  })
}

export default Main