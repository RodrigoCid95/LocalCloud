import type { Server } from 'socket.io'
import 'pxio'
import 'pxio/server'
import 'pxio/http'
import 'pxio/sockets'
import 'pxio/workers'
import './types'

declare global {
  const SETUP: boolean
  const io: Server
  const isJSON: (text: string) => boolean
}