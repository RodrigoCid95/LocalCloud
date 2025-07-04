import { spawn } from 'node:child_process'

export const process = (): Process.Run => ({ title, command, args, proc, out }) => new Promise(resolve => {
  const TITLE = `[${title}]:`
  const child_process = spawn(command, args)
  child_process.on('close', resolve)
  child_process.stdout.on('data', (data) => {
    const output = data.toString('utf8')
    if (out) {
      out(output)
    }
    console.log(TITLE, output)
  })
  child_process.stderr.on('data', (data) => console.error(TITLE, data.toString('utf8')))
  child_process.on('error', (error) => console.log(TITLE, error.message))
  if (proc) {
    proc(child_process.stdin)
  }
})