declare global {
  namespace Apps {
    interface App {
      id_app: number
      package_name: string
      title: string
      description: string
      author: string
      icon: string
      dependences: string[]
      secureSources: {
        font: string
        img: string
        connect: string
        script: string
      }
    }
    type New = Partial<App>
    interface Result extends Omit<Omit<App, 'dependences'>, 'secureSources'> {
      dependences: string
      font: string
      img: string
      connect: string
      script: string
    }
  }
}

export { }