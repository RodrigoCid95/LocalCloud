import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators/custom-element.js'
import { state } from 'lit/decorators/state.js'

import './components/file'
import './components/folder'

const NAME_DIRECTORIES: any = {
  shared: 'Carpeta compartida',
  user: 'Carpeta personal'
}

@customElement('page-files')
export default class PageFiles extends LitElement {
  @state() private path: string[] = []
  @state() private folders: FileInfo[] = []
  @state() private files: FileInfo[] = []
  async go(newPath: string[]) {
    this.path = newPath
    if (newPath.length > 0) {
      const path = [...newPath]
      const base = path.shift()
      const loading = await window.loadingController.create({ message: 'Cargando contenido ...' })
      await loading.present()
      let results = await window.server.send<FileInfo[]>({
        endpoint: `fs/${base}/list`,
        method: 'post',
        data: JSON.stringify({ path: path.join('|') })
      })
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
  createFolder() {
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
              if (!/^[a-zA-Z0-9_-\s]+$/.test(name)) {
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
                await window.server.send({
                  endpoint: `fs/${base}`,
                  method: 'post',
                  data: JSON.stringify({ path: [...segments, name].join('|') })
                })
                await loading.dismiss()
                go([base, ...segments])
              }
            }
          }
        ]
      })
      .then(alert => alert.present())
  }
  selectFile() {
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
  render() {
    return html`
      <ion-header>
        <ion-toolbar>
          <ion-title>Archivos</ion-title>
          ${this.path.length === 0 ? '' : html`
            <ion-buttons slot="end">
              <ion-button button @click=${() => this.go(this.path)}>
                <ion-icon slot="icon-only" name="reload"></ion-icon>
              </ion-button>
            </ion-buttons>
          `}
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <style>
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
        </style>
        ${this.path.length === 0 ? '' : html`
          <div class="breadcrumbs">
            <ion-card>
              <ion-card-content>
                <ion-breadcrumbs>
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
                @go=${(e: CustomEvent) => this.go(e.detail)}
              ></folder-item>
            `)}
            ${this.files.map(file => html`
              <file-item
                .path=${this.path}
                .file=${file}
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
        ${this.path.length === 0 ? '' : html`
          <ion-fab slot="fixed" horizontal="end" vertical="bottom">
            <ion-fab-button>
              <ion-icon name="add"></ion-icon>
            </ion-fab-button>
            <ion-fab-list side="top">
              <ion-fab-button @click=${this.createFolder.bind(this)}>
                <ion-icon name="folder-outline"></ion-icon>
              </ion-fab-button>
              <ion-fab-button @click=${this.selectFile.bind(this)}>
                <ion-icon name="cloud-upload-outline"></ion-icon>
              </ion-fab-button>
            </ion-fab-list>
          </ion-fab>
        `}
      </ion-content>
    `
  }
  createRenderRoot = () => this
}