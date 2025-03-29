import cluster from 'node:cluster'
import http from 'node:http'
import fs from 'node:fs'
import { setupMaster } from '@socket.io/sticky'
import { setupPrimary } from '@socket.io/cluster-adapter'

const appsCount = fs.readdirSync(getConfig('paths').system.apps).filter(item => item !== 'temp').length
const SETUP = appsCount === 0

if (cluster.isPrimary) {
  let numCPUs = Number(getFlag('i'))
  numCPUs = isNaN(numCPUs) ? 1 : numCPUs
  const httpServer = http.createServer()
  setupMaster(httpServer, { loadBalancingMethod: "least-connection" })
  setupPrimary()
  cluster.setupPrimary({ serialization: 'advanced' })
  httpServer.listen(3000)
  const emitToWorker = initWorkerServer()
  console.log(`\n\nMaster ${process.pid} is running`, `\n${numCPUs} workers:\n`)
  const PORTS = Array.from({ length: numCPUs }, (_, i) => 3001 + i)
  for (const PORT of PORTS) {
    const env = { PORT }
    if (IS_RELEASE) {
      env['ESBUILD_BINARY_PATH'] = process.env.ESBUILD_BINARY_PATH
    }
    const child = cluster.fork(env)
    if (SETUP) {
      child.on('exit', () => process.kill(process.pid))
    }
    child.on('message', async message => {
      const { uid, event, args } = message
      let result = null
      result = await emitToWorker(event, args)
      child.send({ uid, data: result })
    })
  }
} else {
  Object.defineProperty(global, 'SETUP', { value: SETUP, writable: false })
  const { http } = initHttpServer({})
  const io = initSocketsServer({ http })
  Object.defineProperty(global, 'io', { value: io, writable: false })
}