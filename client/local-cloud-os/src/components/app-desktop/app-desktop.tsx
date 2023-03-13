import { ICapacitor, LoadingController } from 'types/capacitor'
import { IWindow, ManifestResult } from 'types/task-manager'
import { Component, h, Element, State } from '@stencil/core'

declare const Capacitor: ICapacitor
declare const loadingController: LoadingController

@Component({
  tag: 'app-desktop',
  styleUrl: 'app-desktop.css'
})
export class AppDesktop {
  @Element() private el: HTMLAppDesktopElement
  @State() private manifestResults: ManifestResult[] = []
  private appList: IWindow[] = []
  private progressBar: HTMLIonProgressBarElement
  private modal: HTMLIonModalElement
  private desktopArea: HTMLDivElement
  async componentDidLoad() {
    this.progressBar = this.el.querySelector('ion-progress-bar')
    this.modal = this.el.querySelector('ion-modal')
    this.desktopArea = this.el.querySelector('.desktop')
    const loading = await loadingController.create({ message: 'Cargando...' })
    await loading.present()
    this.manifestResults = (await Capacitor.Plugins.ServerConnector.emit<ManifestResult[]>('apps manifests', {})) || []
    this.el.querySelector<HTMLIonButtonElement>('#play').addEventListener('click', () => this.modal.present())
    await loading.dismiss()
  }
  private closeLauncher() {
    this.modal.dismiss()
  }
  private orderIndexes(start: number) {
    for (const app of this.appList) {
      let zIndex = parseInt(app.style.zIndex)
      if (zIndex > start) {
        zIndex--
        app.tabIndex = zIndex
        app.style.zIndex = zIndex.toString()
      }
    }
  }
  private async launch({ packageName }: ManifestResult) {
    this.progressBar.style.display = 'block'
    this.closeLauncher()
    const task = await Capacitor.Plugins.TaskManager.launch({
      packageName,
      containerElement: this.desktopArea
    })
    const element: IWindow = task.element as any
    element.tabIndex = this.appList.length
    element.style.zIndex = element.tabIndex.toString()
    const btnTask = document.createElement('ion-chip')
    btnTask.innerHTML = `${task.icon ? `<ion-avatar><img alt="${task.name}" src="${task.icon}" /></ion-avatar>` : '<ion-icon name="browsers-outline"></ion-icon>'}<ion-label>${task.title}</ion-label><ion-icon name="close-circle" />`
    element.addEventListener('onClose', () => {
      btnTask.remove()
      this.orderIndexes((element.tabIndex + 1))
    })
    element.addEventListener('focus', () => {
      btnTask.setAttribute('color', 'primary')
      let appIndex = parseInt(element.style.zIndex)
      const apps = this.appList
      if (apps.length > 1 && appIndex < apps.length) {
        this.orderIndexes(appIndex);
        element.tabIndex = apps.length;
        element.style.zIndex = apps.length.toString()
      }
    })
    element.addEventListener('blur', () => btnTask.removeAttribute('color'))
    btnTask.querySelector('ion-icon').addEventListener('click', task.kill)
    btnTask.addEventListener('click', () => {
      if (element.minimize) {
        element.minimize = false;
        element.focus()
      } else {
        const zIndex = parseInt(element.style.zIndex)
        if (zIndex === this.appList.length) {
          element.minimize = true
        } else {
          element.focus()
        }
      }
    })
    this.el.querySelector('.tasks').append(btnTask)
    this.appList.push(element)
    this.progressBar.style.display = 'none'
  }
  render() {
    return (
      <ion-app style={{ 'z-index': '0' }}>
        <ion-progress-bar type="indeterminate" style={{ 'display': 'none' }}></ion-progress-bar>
        <div class="desktop" slot="desktop" />
        <ion-modal id="launcher">
          <ion-header>
            <ion-toolbar>
              <ion-title>Apps</ion-title>
              <ion-buttons slot='end'>
                <ion-button color='primary' onClick={this.closeLauncher.bind(this)}>
                  <ion-icon slot='icon-only' name='close-outline' />
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <ion-list>
              {this.manifestResults.map((manifest, ind) => (
                <ion-item key={ind} onClick={() => this.launch(manifest)} style={{ cursor: 'pointer' }}>
                  <ion-thumbnail slot="start">
                    <img alt={manifest.packageName} src={manifest.icon} />
                  </ion-thumbnail>
                  <ion-label>
                    {manifest.title}
                    <p>
                      {manifest.description}
                    </p>
                  </ion-label>
                </ion-item>
              ))}
            </ion-list>
          </ion-content>
        </ion-modal>
        <ion-footer style={{ 'z-index': '0' }} translucent={true}>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-button id="play" color="primary">
                <ion-icon slot="icon-only" name="apps-outline" />
              </ion-button>
            </ion-buttons>
            <div class="tasks" />
          </ion-toolbar>
        </ion-footer>
      </ion-app>
    )
  }
}