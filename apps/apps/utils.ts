import type { AppInfo } from './types'

export const currentPackageName = location.pathname.split('/').filter(Boolean)[1] ?? ''

export const getExtensions = (app: AppInfo) => app.extentions ?? []

export const getSourceKey = (sourceType: LocalCloud.SourceType, sourceId: number) => `${sourceType}:${sourceId}`
