export type AppLaunchMode = 'same-tab' | 'new-tab' | 'new-window'

export interface DesktopPreferences {
  appLaunchMode?: AppLaunchMode
}

export const preferencesKey = 'preferences'
export const defaultAppLaunchMode: AppLaunchMode = 'same-tab'

export const isAppLaunchMode = (value: string | null): value is AppLaunchMode => (
  value === 'same-tab' || value === 'new-tab' || value === 'new-window'
)
