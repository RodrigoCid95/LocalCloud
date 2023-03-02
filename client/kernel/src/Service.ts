import { IServer } from 'builder'

export default class Service {
  constructor(public readonly server: IServer) { }
  onKill() { }
}