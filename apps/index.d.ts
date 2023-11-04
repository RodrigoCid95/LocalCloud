import type { Server } from "./system/core/server"

declare global {
  interface Window {
    loadCore(): Promise<void>
    server: Server
    key: string
    token?: string
  }
}