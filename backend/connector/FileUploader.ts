declare const TOKEN: string
export class FileUploader extends EventTarget implements FileTransfer {
  #xhr: XMLHttpRequest
  #form: FormData
  #progress: number = 0

  public get progress() {
    return this.#progress
  }

  constructor(endpoint: string, files: FileOptions[] = [], metadata: MetaData = {}) {
    super()
    this.#xhr = new XMLHttpRequest()
    this.#form = new FormData()
    files.forEach(({ name, file }) => this.#form.append(name, file))
    Object.entries(metadata).forEach(([name, value]) => this.#form.append(name, value))
    this.#xhr.open('PUT', endpoint)
    this.#xhr.setRequestHeader('token', TOKEN)
    this.#xhr.addEventListener('loadend', this.#handleLoadEnd)
    this.#xhr.upload.addEventListener('progress', this.#handleProgress)
    this.#xhr.addEventListener('error', () => this.dispatchEvent(new CustomEvent('error')))
    this.#xhr.addEventListener('abort', () => this.dispatchEvent(new CustomEvent('abort')))
  }

  #handleLoadEnd = () => {
    try {
      const isJSON = this.#xhr.getResponseHeader('content-type')?.includes('application/json')
      const response = isJSON ? JSON.parse(this.#xhr.response) : this.#xhr.response
      this.dispatchEvent(new CustomEvent('end', { detail: response }))
    } catch (error) {
      this.dispatchEvent(new CustomEvent('error'))
    }
    this.#progress = 100
  }

  #handleProgress = (event: ProgressEvent) => {
    if (event.lengthComputable) {
      this.#progress = Number(((event.loaded / event.total) * 100).toFixed(2))
      this.dispatchEvent(new CustomEvent('progress', { detail: this.#progress }))
      if (this.#progress === 100) {
        const isJSON = this.#xhr.getResponseHeader('content-type')?.includes('application/json')
        const response = isJSON ? JSON.parse(this.#xhr.response) : this.#xhr.response
        this.dispatchEvent(new CustomEvent('end', { detail: response }))
      }
    }
  }

  start = () => this.#xhr.send(this.#form)
  cancel = () => this.#xhr.abort()
}