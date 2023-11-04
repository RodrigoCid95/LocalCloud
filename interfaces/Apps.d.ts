export interface App {
  id: number
  packageName: string
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
export type NewApp = Partial<Omit<App, 'id'>>
export interface AppDBResult extends Omit<Omit<Omit<Omit<App, 'id'>, 'packageName'>, 'dependences'>, 'secureSources'> {
  id_app: number
  package_name: string
  dependences: string
  font: string
  img: string
  connect: string
  script: string
}