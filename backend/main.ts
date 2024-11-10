import cluster from 'node:cluster'
import path from 'node:path'

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
      env['ESBUILD_BINARY_PATH'] = path.join(process.cwd(), 'esbuild')
    }
    const child = cluster.fork(env)
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
  initHttpServer({})
}
