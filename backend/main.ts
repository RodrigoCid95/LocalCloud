import cluster from "node:cluster"

declare const initHttpServer: PXIOServer.InitHttpServer

if (cluster.isPrimary) {
  const os = require('node:os')
  const numCPUs = os.availableParallelism()
  console.log(`\n\nMaster ${process.pid} is running`, `\n${numCPUs} workers:\n`)

  const PORTS = Array.from({ length: numCPUs }, (_, i) => 3000 + i)
  for (const PORT of PORTS) {
    cluster.fork({ PORT })
  }
} else {
  initHttpServer({ onMessage: console.log })
}