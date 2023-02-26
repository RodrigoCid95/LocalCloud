import { Server } from 'types'

export default class Service {
  constructor(public readonly server: Server) { }
  onKill() { }
}