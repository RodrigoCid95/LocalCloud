export type TransferKind = 'upload' | 'download'

export type TransferStatus = 'uploading' | 'downloading' | 'paused' | 'complete' | 'error' | 'canceled'

export type TransferTask = {
  id: string
  kind: TransferKind
  name: string
  path: string
  status: TransferStatus
  loaded: number
  total: number
  percent: number
  lengthComputable: boolean
  message?: string
}
