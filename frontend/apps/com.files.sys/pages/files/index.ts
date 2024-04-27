import type { ActionSheetOptions } from '@ionic/core'
import { LitElement, html, type PropertyValueMap } from 'lit'
import { customElement } from 'lit/decorators/custom-element.js'
import { state } from 'lit/decorators/state.js'
import { createRef, ref } from 'lit/directives/ref.js'

import './components/file'
import './components/folder'

const NAME_DIRECTORIES: any = {
  shared: 'Carpeta compartida',
  user: 'Carpeta personal'
}

@customElement('page-files')
export default class PageFiles extends LitElement {
  @state() private path: string[] = []
  @state() private folders: FS.ItemInfo[] = []
  @state() private files: FS.ItemInfo[] = []
  private breadcrumbs = createRef<HTMLIonBreadcrumbsElement>()
  private clipboardCopy: string[] | undefined
  private clipboardCut: string[] | undefined
  private async go(newPath: string[]) {
    this.path = newPath
    this.folders = []
    this.files = []
    if (newPath.length > 0) {
      const path = [...newPath]
      const base = path.shift()
      const loading = await window.loadingController.create({ message: 'Cargando contenido ...' })
      await loading.present()
      let results: FS.ItemInfo[] | FS.PathNotFound
      if (base === 'shared') {
        results = await window.connectors.fs.sharedLs(path)
      } else {
        results = await window.connectors.fs.userLs(path)
      }
      if (typeof results === 'object') {
        results = []
      }
      results = results.sort()
      const folders = []
      const files = []
      for (const result of results) {
        if (result.isFile) {
          files.push(result)
        } else {
          folders.push(result)
        }
      }
      this.folders = folders
      this.files = files
      await loading.dismiss()
    }
  }
  private createFolder() {
    const go = this.go.bind(this)
    const segments = [...this.path]
    const base: string = segments.shift() as string
    window.alertController
      .create({
        header: 'Crear carpeta',
        message: 'Escribe el nombre de la nueva carpeta',
        inputs: [{
          name: 'name',
          type: 'text'
        }],
        buttons: [
          {
            role: 'cancel',
            text: 'Cancelar'
          },
          {
            role: 'destructive',
            text: 'Crear',
            async handler({ name }) {
              if (!/^[a-zA-Z0-9_ ]+(?:\.[a-zA-Z0-9_ ]+)*$/.test(name)) {
                window.alertController
                  .create({
                    header: 'Nombre inválido',
                    message: 'El nombre que indicaste no es válido.',
                    buttons: ['Aceptar']
                  })
                  .then(alert => alert.present())
              } else {
                const loading = await window.loadingController.create({ message: 'Creando carpeta ...' })
                await loading.present()
                const path = [...segments, name]
                if (base === 'shared') {
                  await window.connectors.fs.sharedMkdir(path)
                } else {
                  await window.connectors.fs.userMkdir(path)
                }
                await loading.dismiss()
                go([base, ...segments])
              }
            }
          }
        ]
      })
      .then(alert => alert.present())
  }
  private selectFile() {
    const { path } = this
    const inputFile = document.createElement('input')
    inputFile.type = 'file'
    inputFile.multiple = true
    inputFile.addEventListener('change', () => {
      if (inputFile.files) {
        for (let index = 0; index < inputFile.files.length; index++) {
          const file = inputFile.files.item(index)
          if (file) {
            document.querySelector('page-swaps')?.addItem([...path], file)
          }
        }
      }
    })
    inputFile.click()
  }
  protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    super.updated(_changedProperties)
    setTimeout(() => {
      const { value } = this.breadcrumbs
      if (value) {
        value.scrollLeft = value.scrollWidth - value.clientWidth
      }
    }, 100)
  }
  private async paste() {
    const loading = await window.loadingController.create({})
    if (this.clipboardCopy) {
      loading.message = 'Copiando ...'
      await loading.present()
      await window.connectors.fs.copy(this.clipboardCopy, this.path)
      this.clipboardCopy = undefined
    }
    if (this.clipboardCut) {
      loading.message = 'Moviendo ...'
      await loading.present()
      await window.connectors.fs.copy(this.clipboardCut, this.path)
      this.clipboardCut = undefined
    }
    await loading.dismiss()
    this.go(this.path)
  }
  private rename(path: string[], renew: boolean = false) {
    const reload = (newName: string) => {
      if (renew) {
        this.path.pop()
        this.path.push(newName)
      }
      this.go(this.path)
    }
    window.alertController
      .create({
        header: 'Renombrar',
        message: 'Escribe el nuevo nombre',
        inputs: [{
          type: 'text',
          name: 'nName',
          value: path[path.length - 1]
        }],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Renombrar',
            async handler({ nName }) {
              const newName = nName.trim()
              if (newName) {
                if (!/^[a-zA-Z0-9_ ]+(?:\.[a-zA-Z0-9_ ]+)*$/.test(newName)) {
                  window.alertController
                    .create({
                      header: 'Nombre inválido',
                      message: 'El nombre que indicaste no es válido.',
                      buttons: ['Aceptar']
                    })
                    .then(alert => alert.present())
                } else {
                  const loading = await window.loadingController.create({ message: 'Renombrando ...' })
                  await loading.present()
                  await window.connectors.fs.rename(path, newName)
                  await loading.dismiss()
                  reload(newName)
                }
              }
            }
          }
        ]
      })
      .then(alert => alert.present())
  }
  async handlerOptions() {
    const rename = this.rename.bind(this)
    const buttons: ActionSheetOptions['buttons'] = [
      {
        text: 'Actualizar',
        handler: () => this.go(this.path)
      },
      {
        text: 'Crear carpeta',
        handler: this.createFolder.bind(this)
      },
      {
        text: 'Subir archivo',
        handler: this.selectFile.bind(this)
      }
    ]
    if (this.path.length > 1) {
      buttons.push({
        text: 'Renombrar',
        handler: () => rename([...this.path], true)
      })
    }
    if (this.clipboardCopy || this.clipboardCut) {
      buttons.push({
        text: 'Pegar',
        handler: this.paste.bind(this)
      })
    }
    buttons.push({
      text: 'Cancelar',
      role: 'cancel'
    })
    const baseDir = this.path[this.path.length - 1]
    const actionSheet = await window.actionSheetController.create({
      header: NAME_DIRECTORIES[baseDir] || baseDir,
      buttons
    })
    await actionSheet.present()
  }
  render() {
    return html`
      <ion-header>
        <ion-toolbar>
          <ion-title>Archivos</ion-title>
          ${this.path.length === 0 ? '' : html`
            <ion-buttons slot="end">
              <ion-button button @click=${this.handlerOptions.bind(this)}>
                <ion-icon slot="icon-only" name="options"></ion-icon>
              </ion-button>
            </ion-buttons>
          `}
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <style>
          ion-list {
            position: fixed;
            max-height: calc(100% - 165px);
            width: calc(100% - 32px);
            overflow-y: auto !important;
          }
          .breadcrumbs {
            display: contents;
          }
          ion-breadcrumbs {
            overflow: auto;
            flex-wrap: nowrap;
            scroll-behavior: smooth;
          }
          ion-breadcrumb {
            cursor: pointer;
          }
          folder-item {
            position: relative;
          }
        </style>
        ${this.path.length === 0 ? '' : html`
          <div class="breadcrumbs">
            <ion-card>
              <ion-card-content>
                <ion-breadcrumbs ${ref(this.breadcrumbs)}>
                  <ion-breadcrumb @click=${() => this.go([])}>Inicio</ion-breadcrumb>
                  ${this.path.map((path, index, array) => html`
                    <ion-breadcrumb @click=${() => this.go(array.slice(0, index + 1))}>
                      ${NAME_DIRECTORIES[path] || path}
                    </ion-breadcrumb>
                  `)}
                </ion-breadcrumbs>
              </ion-card-content>
            </ion-card>
          </div>
        `}
        <ion-list inset>
          ${this.path.length > 0 ? html`
            ${this.folders.map(folder => html`
              <folder-item
                .path=${this.path}
                .folder=${folder}
                @go=${({ detail }: CustomEvent) => this.go(detail)}
                @copy=${({ detail }: CustomEvent) => this.clipboardCopy = detail}
                @cut=${({ detail }: CustomEvent) => this.clipboardCut = detail}
                @delete=${() => this.go(this.path)}
                @rename=${({ detail }: CustomEvent) => this.rename(detail)}
              ></folder-item>
            `)}
            ${this.files.map(file => html`
              <file-item
                .path=${this.path}
                .file=${file}
                @copy=${({ detail }: CustomEvent) => this.clipboardCopy = detail}
                @cut=${({ detail }: CustomEvent) => this.clipboardCut = detail}
                @delete=${() => this.go(this.path)}
                @rename=${({ detail }: CustomEvent) => this.rename(detail)}
              ></file-item>
            `)}
            ${this.folders.length === 0 && this.files.length === 0 ? html`
              <ion-item>
                <ion-label class="ion-text-center">No hay elementos.</ion-label>
              </ion-item>
            ` : ''}
          ` : html`
            <ion-item button @click=${() => this.go(['shared'])}>
              <ion-icon slot="start" name="share-outline"></ion-icon>
              <ion-label>Carpeta compartida</ion-label>
            </ion-item>
            <ion-item button @click=${() => this.go(['user'])}>
              <ion-icon slot="start" name="home-outline"></ion-icon>
              <ion-label>Carpeta personal</ion-label>
            </ion-item>
          `}
        </ion-list>
      </ion-content>
    `
  }
  createRenderRoot = () => this
}