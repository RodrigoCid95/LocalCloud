import cluster from 'node:cluster'
import fs from 'node:fs'

const appsCount = fs.readdirSync(getConfig('paths').system.apps).filter(item => item !== 'temp').length
const SETUP = appsCount === 0

if (cluster.isPrimary) {
  let numCPUs = Number(getFlag('i'))
  numCPUs = isNaN(numCPUs) ? 1 : numCPUs
  console.log(`\n\nMaster ${process.pid} is running`, `\n${numCPUs} workers:\n`)
  const Store = {
    store: new Map(),
    get: (sid: string) => Store.store.get(sid) || null,
    set: (sid: string, session: any) => {
      Store.store.set(sid, session)
      return null
    },
    destroy: (sid: string) => {
      Store.store.delete(sid)
      return null
    },
    delete: (sid: string) => {
      Store.store.delete(sid)
      return null
    },
    length: () => {
      Store.store.size
      return null
    },
    all: () => Array.from(Store.store.values()),
    clear: () => Store.store.clear()
  }
  const PORTS = Array.from({ length: numCPUs }, (_, i) => 3000 + i)
  for (const PORT of PORTS) {
    const env = { PORT }
    if (IS_RELEASE) {
      env['ESBUILD_BINARY_PATH'] = process.env.ESBUILD_BINARY_PATH
    }
    const child = cluster.fork(env)
    if (SETUP) {
      child.on('exit', () => process.kill(process.pid))
    }
    child.on('message', message => {
      const { uid, event, args = [] } = message
      const e = Store[event]
      let result = null
      if (e) {
        result = e(...args)
      } else {
        console.log('Error: Store command not fount', message)
      }
      child.send({ uid, data: result })
    })
  }
} else {
  Object.defineProperty(global, 'SETUP', { value: SETUP, writable: false })
  initHttpServer({})
}