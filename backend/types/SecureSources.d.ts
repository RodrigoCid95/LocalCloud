declare global {
  namespace SecureSources {
    interface Source {
      id: string
      type: 'image' | 'media' | 'object' | 'script' | 'style' | 'worker' | 'font' | 'connect'
      source: string
      description: string
      enable: boolean
    }
  }
}

export { }