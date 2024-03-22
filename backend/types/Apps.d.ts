declare global {
  namespace Apps {
    interface App {
      package_name: string
      title: string
      description: string
      author: string
      icon: string
      permissions: string[]
      secureSources: {
        font: string
        img: string
        connect: string
        script: string
      }
    }
    type New = Partial<App>
    interface Result extends Omit<Omit<App, 'permissions'>, 'secureSources'> {
      permissions: string
      font: string
      img: string
      connect: string
      script: string
    }
  }
}

export { }