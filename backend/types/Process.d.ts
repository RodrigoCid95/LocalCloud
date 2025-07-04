import type internal from 'node:stream'

declare global {
  namespace Process {
    interface RunOptions {
      title: string
      command: string
      args: string[]
      proc?: (stdin: internal.Writable) => void
      out?: (data: string) => void
    }
    type Run = (options: RunOptions) => Promise<void>
  }
}

export { }