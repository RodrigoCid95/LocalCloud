export type AppInfo = LocalCloud.App
export type PermissionInfo = LocalCloud.Permission
export type SourceInfo = LocalCloud.Source

export type SourceGroup = {
  type: LocalCloud.SourceType
  sources: SourceInfo[]
}

export type UpdateStatus = 'idle' | 'uploading' | 'complete' | 'error' | 'canceled'

export type UpdateTask = {
  packageName: string
  fileName: string
  status: UpdateStatus
  loaded: number
  total: number
  percent: number
  lengthComputable: boolean
  message?: string
}
