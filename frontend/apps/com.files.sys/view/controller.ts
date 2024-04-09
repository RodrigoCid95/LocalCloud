import template from './template.html'

export class FilesController {
  static template = template
  #breadcrumbsRef: HTMLDivElement
  #listRef: HTMLIonListElement
  #commandsRef: HTMLIonFabElement
  #createFolderRef: HTMLIonFabButtonElement
  #uploadRef: HTMLIonFabButtonElement
  constructor(element: HTMLElement) {
    this.#breadcrumbsRef = element.querySelector('.breadcrumbs')
    this.#listRef = element.querySelector('ion-list')
    this.#commandsRef = document.querySelector('.commands')
    this.#createFolderRef = document.getElementById('create-folder') as HTMLIonFabButtonElement
    this.#uploadRef = document.getElementById('upload') as HTMLIonFabButtonElement
    this.loadItems('', [])
    const alert = (header: string, message: string) => {
      window.alertController
        .create({
          header,
          message,
          buttons: ['Aceptar']
        })
        .then(alert => alert.present())
    }
    const createLoading = async (message: string) => {
      const loading = await window.loadingController.create({ message })
      await loading.present()
      return loading
    }
    this.#createFolderRef.addEventListener('click', async () => {
      const { path } = this.#commandsRef.dataset
      const segments = path.split('|')
      const base = segments.shift()
      const loadItems = this.loadItems.bind(this)
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
                  alert('Nombre inválido', 'El nombre que indicaste no es válido.')
                } else {
                  const loading = await createLoading('Creando...')
                  await window.server.send({
                    endpoint: `/api/fs/${base}`,
                    method: 'post',
                    data: JSON.stringify({ path: [...segments, name].join('|') })
                  }).then(response => response.json())
                  await loading.dismiss()
                  loadItems(base, segments)
                }
              }
            }
          ]
        })
        .then(alert => alert.present())
    })
    this.#uploadRef.addEventListener('click', () => {
      const { path } = this.#commandsRef.dataset
      const segments = path.split('|')
      const base = segments.shift()
      console.log(base, ...segments)
    })
  }
  listenLinks(base: HTMLElement = this.#listRef) {
    base.querySelectorAll('[data-link]').forEach((linkElement: HTMLElement) => {
      linkElement.addEventListener('click', () => {
        if (linkElement.getAttribute('button') !== null || linkElement.tagName === 'ION-BREADCRUMB') {
          const { link } = linkElement.dataset
          const segments = link.split('|')
          const base = segments.shift()
          this.loadItems(base, segments)
        }
      })
      linkElement.addEventListener('contextmenu', (e) => {
        if (linkElement.tagName !== 'ION-BREADCRUMB') {
          (linkElement.parentElement as HTMLIonItemSlidingElement).open('end')
          e.preventDefault()
        }
      })
    })
    base.querySelectorAll('[data-delete]').forEach((deleteElement: HTMLElement) => deleteElement.addEventListener('click', async () => {
      const { delete: dlt } = deleteElement.dataset
      const path = dlt.split('|')
      const base = path.shift()
      const loading = await window.loadingController.create({ message: 'Eliminando...' })
      await loading.present()
      await window.server.send({
        endpoint: `/api/fs/${base}`,
        method: 'delete',
        data: JSON.stringify({
          path: path.join('|')
        })
      })
      await loading.dismiss()
      path.pop()
      this.loadItems(base, path)
    }))
    base.querySelectorAll('[data-download]').forEach((downloadElement: HTMLElement) => downloadElement.addEventListener('click', () => {
      const { download } = downloadElement.dataset
      const path = download.split('|')
      const base = path.shift()
      const { href } = window.server.createURL('file', base, ...path)
      const anchor = document.createElement('a')
      anchor.download = path[path.length - 1]
      anchor.href = href
      anchor.click()
    }))
  }
  async loadItems(base: string, segments: string[]) {
    if (base === '') {
      this.#listRef.innerHTML = '<ion-item button data-link="shared"><ion-icon slot="start" name="share-outline"></ion-icon><ion-label>Carpeta compartida</ion-label></ion-item><ion-item button data-link="user"><ion-icon slot="start" name="home-outline"></ion-icon><ion-label>Home</ion-label></ion-item>'
      this.#breadcrumbsRef.innerHTML = ''
      this.#commandsRef.removeAttribute('data-path')
      this.listenLinks()
    } else {
      this.initBreadcrumbs(base, segments)
      const results: FileInfo[] = await window.server.send({
        endpoint: `/api/fs/${base}/list`,
        method: 'post',
        data: JSON.stringify({
          path: segments.join('|')
        })
      }).then(response => response.json())
      if (results.length > 0) {
        let itemsHTML = ''
        const folderItems = results.filter(item => !item.isFile)
        const fileItems = results.filter(item => item.isFile)
        const items = [...folderItems, ...fileItems]
        for (const item of items) {
          const newPath = [base, ...segments, item.name].join('|')
          const formatSize = (bytes: number) => {
            if (bytes === 0) return '0 Bytes'
            const k = 1024
            const unidades = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
            const i = Math.floor(Math.log(bytes) / Math.log(k))
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + unidades[i]
          }
          let itemHTML = `
            <ion-item-sliding>
              <ion-item${item.isFile ? '' : ` button`} data-link="${newPath}">
                <ion-icon slot="start" name="${item.isFile ? 'document' : 'folder'}-outline"></ion-icon>
                <ion-label>
                  ${item.name}
                  <p>Tamaño: ${formatSize(item.size)}</p>
                </ion-label>
              </ion-item>
              <ion-item-options slot="end">
                ${!item.isFile ? '' : `
                <ion-item-option data-download="${newPath}">
                  <ion-icon slot="icon-only" name="cloud-download-outline"></ion-icon>
                </ion-item-option>
                `}
                <ion-item-option color="danger" data-delete="${newPath}">
                  <ion-icon slot="icon-only" name="trash"></ion-icon>
                </ion-item-option>
              </ion-item-options>
            </ion-item-sliding>
          `
          itemsHTML += itemHTML
        }
        this.#listRef.innerHTML = itemsHTML
        this.listenLinks()
      } else {
        this.#listRef.innerHTML = '<ion-item><ion-label>No hay archivos</ion-label></ion-item>'
      }
      const path = [base, ...segments]
      this.#commandsRef.setAttribute('data-path', path.join('|'))
    }
  }
  initBreadcrumbs(base: string, segments: string[]) {
    const BASE_DIRS = {
      'shared': 'Carpeta compartida',
      'user': 'Home'
    }
    let breadcrumbsHTML = '<ion-card><ion-card-content><ion-breadcrumbs>'
    const paths = []
    segments = ['Inicio', base, ...segments]
    for (const segment of segments) {
      if (segment !== 'Inicio') {
        paths.push(segment)
      }
      breadcrumbsHTML += `<ion-breadcrumb data-link="${segment === 'Inicio' ? '' : paths.join('|')}">${BASE_DIRS[segment] || segment}</ion-breadcrumb>`
    }
    breadcrumbsHTML += '</ion-breadcrumbs></ion-card-content></ion-card>'
    this.#breadcrumbsRef.innerHTML = breadcrumbsHTML
    setTimeout(() => {
      const breadcrumbsElement = this.#breadcrumbsRef.querySelector('ion-breadcrumbs')
      breadcrumbsElement.scrollLeft = breadcrumbsElement.scrollWidth - breadcrumbsElement.clientWidth
    }, 100)
    this.listenLinks(this.#breadcrumbsRef)
  }
}