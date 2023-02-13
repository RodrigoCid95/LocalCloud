import OS from "kernel/lib/OS"
import { Server } from "types"

declare global {
  interface Window {
    os: OS
    server: Server
  }
}