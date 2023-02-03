import { ProgramArguments } from 'types'
import css from './style.scss'
import template from './template.html'

export default (args: ProgramArguments) => {
  const { Program, launch } = args
  return class DesktopProgram extends Program {
    async connectedCallback() {
      super.connectedCallback()
      this.shadowRoot.adoptedStyleSheets.push(css)
      this.shadowRoot.innerHTML = template
      await launch({
        packageName: 'com.launcher.app',
        containerElement: this.shadowRoot as unknown as HTMLElement
      })
      await launch({
        packageName: 'com.taskbar.app',
        containerElement: this.shadowRoot as unknown as HTMLElement
      })
      const appLauncherElement: HTMLElement = this.shadowRoot.querySelector('app-launcher') as HTMLElement
      const appTaskbarElement: HTMLElement = this.shadowRoot.querySelector('app-taskbar') as HTMLElement
      appTaskbarElement.addEventListener('onLaunchClick', () => {
        appLauncherElement.toggleAttribute('open')
      })
      appLauncherElement.addEventListener('onLaunchProgram', async ({ detail }: CustomEvent) => {
        const app = await launch({
          packageName: detail,
          containerElement: this
        })
        if (app.type !== 'service') {
          (appTaskbarElement as any).add(app.element)
        }
      })
    }
  }
}