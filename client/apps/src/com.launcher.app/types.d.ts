import Service from "kernel/lib/Service"
import { AppManifest, ProgramManifest, ServiceManifest } from "types"

export type Manifest = ServiceManifest | ProgramManifest | AppManifest
export type Manifests = Manifest[]
export interface LauncherService extends Service {
  getAppList(): Promise<Manifests>
}