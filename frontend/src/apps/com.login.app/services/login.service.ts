import Service from 'kernel/lib/Service'

export default (ClassService: typeof Service) => {
  return class Service1 extends ClassService {
    login() {
      this.server.socket.emit('login/sigin', true)
    }
  }
}