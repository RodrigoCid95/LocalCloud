import type internal from 'node:stream'
import child from 'node:child_process'

export const process = (): Process.Run => ({ title, command, args, proc }: Process.RunOptions): Promise<void> => new Promise(resolve => {
  if (getConfig('isRelease')) {
    const TITLE = `[${title}]:`
    const child_process = child.spawn(command, args)
    child_process.on('close', resolve)
    child_process.stdout.on('data', (data) => console.log(TITLE, data.toString('utf8')))
    child_process.stderr.on('data', (data) => console.error(TITLE, data.toString('utf8')))
    child_process.on('error', (error) => console.log(TITLE, error.message))
    if (proc) {
      proc(child_process.stdin)
    }
  } else {
    resolve()
  }
})

declare global {
  namespace Process {
    interface RunOptions {
      title: string
      command: string
      args: string[]
      proc?: (stdin: internal.Writable) => void
    }
    type Run = (options: RunOptions) => Promise<void>
  }
}