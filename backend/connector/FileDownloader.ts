export class FileDownloader extends EventTarget implements FileTransfer {
  #abortController: AbortController
  #progress: number = 0
  static #db: IDBDatabase | null = null
  id: string
  constructor(private endpoint: string, private filename: string) {
    super()
    this.#abortController = new AbortController()
    this.id = endpoint
    this.#abortController.signal.addEventListener('abort', () => {
      this.dispatchEvent(new Event('abort'))
    })
  }

  public get progress() {
    return this.#progress
  }

  static async initDB() {
    if (this.#db) return this.#db

    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('DownloadDB', 1)
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains('chunks')) {
          const objectStore = db.createObjectStore('chunks', { keyPath: 'id' })
          objectStore.createIndex('id', 'id')
        }
      }
      request.onsuccess = () => {
        this.#db = request.result
        resolve(this.#db)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async storeChunk(chunkIndex: number, data: Uint8Array) {
    const db = await FileDownloader.initDB()
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('chunks', 'readwrite')
      const store = transaction.objectStore('chunks')
      store.put({ id: this.id, chunkIndex, data })
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  async start() {
    await FileDownloader.initDB()
    const existsInDB = await this.checkIfExistsInDB()

    if (existsInDB) {
      console.log('Download found in database, assembling file...')
      this.#progress = 100
      await this.assembleFile()
      this.dispatchEvent(new Event('end'))
    } else {
      console.log('Download not found in database, starting download...')
      await this.downloadFile()
    }
  }

  async checkIfExistsInDB() {
    const db = await FileDownloader.initDB()
    return new Promise<boolean>((resolve, reject) => {
      const transaction = db.transaction('chunks', 'readonly')
      const store = transaction.objectStore('chunks')
      const index = store.index('id')
      const request = index.getKey(this.id)

      request.onsuccess = () => resolve(!!request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async downloadFile() {
    fetch(this.endpoint, { signal: this.#abortController.signal })
      .then(async response => {
        const reader = response.body?.getReader()
        if (!reader) throw new Error('No readable stream')

        const contentLength: number = parseInt(response.headers.get('content-length') || '0')
        let receivedLength = 0
        let chunkIndex = 0

        while (true) {
          const { done, value } = await reader.read()
          if (done || !value) break

          await this.storeChunk(chunkIndex++, value)
          receivedLength += value.length
          this.#progress = Number(((receivedLength / contentLength) * 100).toFixed(2))

          this.dispatchEvent(new CustomEvent('progress', { detail: this.#progress }))
        }

        await this.assembleFile()
        this.dispatchEvent(new Event('end'))
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return
        this.dispatchEvent(new CustomEvent('error', { detail: error }))
      })
  }

  async assembleFile() {
    const db = await FileDownloader.initDB()
    const transaction = db.transaction('chunks', 'readonly')
    const store = transaction.objectStore('chunks')
    const chunks: Uint8Array[] = []

    return new Promise<void>((resolve, reject) => {
      const request = store.openCursor(IDBKeyRange.only(this.id))
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          chunks.push(cursor.value.data)
          cursor.continue()
        } else {
          const blob = new Blob(chunks)
          const url = URL.createObjectURL(blob)
          const anchor = document.createElement('a')
          anchor.href = url
          anchor.download = this.filename
          anchor.click()
          URL.revokeObjectURL(url)
          resolve()
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async clean() {
    const db = await FileDownloader.initDB()
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('chunks', 'readwrite')
      const store = transaction.objectStore('chunks')
      const request = store.openCursor(IDBKeyRange.only(this.id))

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  cancel() {
    this.#abortController.abort()
  }
}