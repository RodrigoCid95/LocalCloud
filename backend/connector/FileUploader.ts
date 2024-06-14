declare const TOKEN: string
export class FileUploader implements FileTransfer {
  #xhr: XMLHttpRequest
  #form: FormData
  #listenerLoadList: any[] = []
  #listenerProgressList: any[] = []
  #progress: number = 0
  public get progress() {
    return this.#progress
  }
  constructor(endpoint: string, files: FileOptions[] = [], metadata: MetaData = {}) {
    this.#xhr = new XMLHttpRequest()
    this.#form = new FormData()
    for (const { name, file } of files) {
      this.#form.append(name, file)
    }
    const meta = Object.entries(metadata)
    for (const [name, value] of meta) {
      this.#form.append(name, value)
    }
    this.#xhr.addEventListener('load', () => {
      const isJSON = this.#xhr.getResponseHeader('content-type')?.includes('application/json')
      const response = isJSON ? JSON.parse(this.#xhr.response) : this.#xhr.response
      for (const listener of this.#listenerLoadList) {
        listener(response)
      }
      this.#progress = 100
    })
    this.#xhr.upload.addEventListener('progress', event => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100
        for (const listener of this.#listenerProgressList) {
          this.#progress = Number(percentComplete.toFixed(2))
          listener(this.#progress)
        }
      }
    })
    this.#xhr.open('PUT', endpoint)
    this.#xhr.setRequestHeader('token', TOKEN)
  }
  on(event: 'progress' | 'end' | 'error' | 'abort', callback: any) {
    if (event === 'end') {
      this.#listenerLoadList.push(callback)
      return
    }
    if (event === 'abort') {
      this.#xhr.addEventListener('abort', callback)
      return
    }
    if (event === 'error') {
      this.#xhr.addEventListener('error', callback)
      return
    }
    if (event === 'progress') {
      this.#listenerProgressList.push(callback)
    }
  }
  off(event: 'progress' | 'end' | 'error' | 'abort', callback: any) {
    if (event === 'end') {
      this.#listenerLoadList = this.#listenerLoadList.filter(listener => listener !== callback)
      return
    }
    if (event === 'abort') {
      this.#xhr.removeEventListener('abort', callback)
      return
    }
    if (event === 'error') {
      this.#xhr.removeEventListener('error', callback)
      return
    }
    this.#listenerProgressList = this.#listenerProgressList.filter(listener => listener !== callback)
  }
  start = () => this.#xhr.send(this.#form)
  cancel = () => this.#xhr.abort()
}