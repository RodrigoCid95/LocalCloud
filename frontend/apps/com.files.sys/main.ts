import { FilesController } from './view/controller'
import template from './template.html'
import { SwapController } from './swap/controller'

document.addEventListener("onReady", async () => {
  let swapCounter = 0
  window.customElements.define('app-swaps', class extends HTMLElement implements HTMLAppSwapsElement {
    connectedCallback() {
      this.innerHTML = SwapController.template
    }
    addItem(swap: FileTransfer, type: 'upload' | 'download', name: string): void {
      const swapsElement = document.getElementById('swaps')
      setTimeout(() => {
        const itemElement = document.createElement('ion-item')
        itemElement.innerHTML = `<ion-icon name="cloud-${type}-outline" slot="start"></ion-icon>`
        const labelElement = document.createElement('ion-label')
        labelElement.innerHTML = name
        const progressElement = document.createElement('p')
        progressElement.innerText = 'Preparando...'
        labelElement.append(progressElement)
        itemElement.append(labelElement)
        const cancelButtonElement = document.createElement('ion-button')
        cancelButtonElement.slot = 'end'
        cancelButtonElement.fill = 'clear'
        cancelButtonElement.innerHTML = '<ion-icon name="close-circle-outline" slot="icon-only" color="dark"></ion-icon>'
        itemElement.append(cancelButtonElement)
        if (swapCounter === 0) {
          swapsElement.innerHTML = ''
        }
        swapsElement.append(itemElement)
        swapCounter++
        let finished: boolean = false
        swap.on('progress', (progress: number) => progressElement.innerText = `${progress.toString()}%`)
        swap.on('end', () => {
          progressElement.innerText = 'Completado.'
          finished = true
        })
        swap.on('error', () => {
          progressElement.innerText = `Ocurrió un error al intentar ${type === 'download' ? 'descargar' : 'subir'} el archivo.`
          finished = true
        })
        swap.on('abort', () => {
          progressElement.innerText = `La ${type === 'download' ? 'descarga' : 'subida'} fue cancelada.`
          finished = true
        })
        cancelButtonElement.addEventListener('click', () => {
          if (finished) {
            itemElement.remove()
            swapCounter--
            if (swapCounter === 0) {
              swapsElement.innerHTML = '<ion-item><ion-label class="ion-text-center">No hay transferencias.</ion-label></ion-item>'
            }
          } else {
            swap.cancel()
          }
        })
        swap.start()
      }, 250)
    }
    addDownload(...path: string[]): void {
      document.querySelector('ion-tabs').select('swap')
      const swap = window.server.createDownloader(...path)
      this.addItem(swap, 'download', path[path.length - 1])
    }
    addUpload(files: File[], ...path: string[]): void {
      if (files.length > 0) {
        document.querySelector('ion-tabs').select('swap')
        for (const file of files) {
          const name = file.name
          const swap = window.server.createUploader({ path, file: { name, file } })
          this.addItem(swap, 'upload', name)
        }
      }
    }
  })
  window.customElements.define('app-files', class extends HTMLElement {
    connectedCallback() {
      this.innerHTML = FilesController.template
      new FilesController(this)
    }
  })
  document.body.innerHTML = template
})

declare global {
  interface AddSwapDownloadOptions {
    type: 'download'
    path: string[]
  }
  interface AddSwapUploadOptions {
    type: 'upload'
    path: string[]
    files: File[]
  }
  interface HTMLAppSwapsElement extends HTMLElement {
    addDownload(...path: string[]): void
    addUpload(files: File[], ...path: string[]): void
  }
  interface HTMLElementTagNameMap {
    "app-swaps": HTMLAppSwapsElement
  }
}