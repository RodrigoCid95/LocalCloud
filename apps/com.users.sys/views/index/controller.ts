import template from "./template.html"
export class IndexController {
  static template = template
  #progressBarRef: HTMLProgressElement
  constructor(private element: HTMLElement) {
    this.#progressBarRef = element.querySelector('#progress') as HTMLProgressElement
    this.#getUsers()
  }
  async #getUsers(): Promise<void> {
    this.#progressBarRef.style.display = 'block'
    const results = await window.server.send('/users', { method: 'get' })
    console.log(results)
    this.#progressBarRef.style.display = 'none'
  }
}