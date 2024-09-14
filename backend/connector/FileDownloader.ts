export class FileDownloader implements FileTransfer {
  #abortController: AbortController
  #listeners = {
    progress: [],
    end: [],
    error: [],
    abort: []
  }
  #progress: number = 0
  public get progress() {
    return this.#progress
  }
  constructor(private endpoint: string, private filename: string) {
    this.#abortController = new AbortController()
    this.#abortController.signal.addEventListener('abort', () => {
      for (const listener of this.#listeners.abort) {
        (listener as any)()
      }
    })
  }
  on(event: 'progress' | 'end' | 'error' | 'abort', callback: any) {
    (this.#listeners[event] as any).push(callback)
  }
  off(event: 'progress' | 'end' | 'error' | 'abort', callback: any) {
    this.#listeners[event] = this.#listeners[event].filter(listener => listener !== callback)
  }
  start() {
    fetch(this.endpoint, { signal: this.#abortController.signal })
      .then(async response => {
        const reader = response.body?.getReader()
        if (reader) {
          const contentLength: number = parseInt(response.headers.get('content-length') || '0')
          let receivedLength = 0
          const chunks: Uint8Array[] = []
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              break
            }
            chunks.push(value)
            receivedLength += value.length
            const percent = (receivedLength / contentLength) * 100
            for (const listener of this.#listeners.progress) {
              this.#progress = Number(percent.toFixed(2));
              (listener as any)(this.#progress)
            }
          }
          const chunksAll = new Uint8Array(receivedLength)
          let position = 0
          for (const chunk of chunks) {
            chunksAll.set(chunk, position)
            position += chunk.length
          }
          const blob = new Blob([chunksAll])
          const url = URL.createObjectURL(blob)
          const anchor = document.createElement('a')
          anchor.href = url
          anchor.download = this.filename
          anchor.click()
          this.#progress = 100
        }
        for (const listener of this.#listeners.end) {
          (listener as any)()
        }
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return
        for (const listener of this.#listeners.error) {
          (listener as any)()
        }
      })
  }
  cancel = () => this.#abortController.abort()
}