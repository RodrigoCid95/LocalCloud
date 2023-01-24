import { KIT } from 'types'
import css from './style.scss'
import template from './template.html'

export const Main = (kit: KIT) => {
  const { Program, launch, manifest } = kit
  class DesktopProgram extends Program {
    async connectedCallback() {
      this.shadowRoot.adoptedStyleSheets.push(css)
      this.shadowRoot.innerHTML = template
      await launch({
        packageName: 'com.desktop.app/com.launcher.app',
        containerElement: this.shadowRoot as unknown as HTMLElement
      })
      await launch({
        packageName: 'com.desktop.app/com.taskbar.app',
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
        });
        (appTaskbarElement as any).add(app)
      })
    }
  }
  if (customElements.get(manifest.tag) === undefined) {
    customElements.define(manifest.tag, DesktopProgram)
  }
}