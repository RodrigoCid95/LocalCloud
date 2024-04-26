declare global {
  namespace Apps {
    interface App {
      package_name: string
      title: string
      description: string
      author: string
    }
  }
}

export { }