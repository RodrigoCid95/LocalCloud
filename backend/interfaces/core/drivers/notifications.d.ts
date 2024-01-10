type EventCallback = () => void | Promise<void>
export interface LocalNotificationDriver {
  body: string
  data?: any
  icon: string
  lang: string
  tag: string
  title: string
  onclose(eventCallback: EventCallback): string
  onclick(eventCallback: EventCallback): string
  onerror(eventCallback: EventCallback): string
  onshow(eventCallback: EventCallback): string
  launch(): Promise<void>
  close(): void
}
export interface LocalNotificationsDriver {
  createNotification(): LocalNotificationDriver
}
export interface LocalNotificationsConstructable {
  new(): LocalNotificationsDriver
}