export interface AppsManagerClass {
  usersPath: string
  systemAppsPath: string
  install(uuid: string, packageName: string, data: Buffer): Promise<void>
  getManifest(packageName: string, uuid: string): Promise<Manifest | null>
  getManifests(uuid: string): Promise<Manifest[]>
  uninstall(uuid: string, packageName: string): Promise<void>
}

export type Manifest = {
  packageName: string
  title: string
  description: string
  author: string[]
  icon: string
  services: {
    [x: string]: any
  }
  type: string
  tag: string
}

export type ManifestResult = {
  packageName: string
  title: string
  description: string
  author: string
  icon: string
  services: string
  type: string
  tag: string
}