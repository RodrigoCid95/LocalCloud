import OS from "kernel/lib/OS"
declare global {
  interface Window {
    os: OS
  }
}