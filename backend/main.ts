import cluster from 'node:cluster'
import http from 'node:http'
import { setupMaster } from '@socket.io/sticky'
import { setupPrimary } from '@socket.io/cluster-adapter'

Object.defineProperty(global, 'isJSON', { value: (text: string) => /^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, '')), writable: false })
process.setMaxListeners(0)
if (cluster.isPrimary) {
  let numCPUs = Number(getFlag('i'))
  numCPUs = isNaN(numCPUs) ? 1 : numCPUs
  const httpServer = http.createServer()
  setupMaster(httpServer, { loadBalancingMethod: "least-connection" })
  setupPrimary()
  cluster.setupPrimary({ serialization: 'advanced' })
  httpServer.listen(3000)
  const emitToWorker = initWorkerServer()
  console.log(`\n\nMaster ${process.pid} is running`, `\n${numCPUs} threads:\n`)
  const PORTS = Array.from({ length: numCPUs }, (_, i) => 3001 + i)
  for (const PORT of PORTS) {
    const env = { PORT }
    if (IS_RELEASE) {
      env['ESBUILD_BINARY_PATH'] = process.env.ESBUILD_BINARY_PATH
    }
    const child = cluster.fork(env)
    child.setMaxListeners(0)
    child.on('message', async message => {
      const { uid, event, args } = message
      let result = null
      result = await emitToWorker(event, args)
      child.send({ uid, data: result })
    })
  }
} else {
  const { http } = initHttpServer({})
  const io = initSocketsServer({ http })
  Object.defineProperty(global, 'io', { value: io, writable: false })
}
