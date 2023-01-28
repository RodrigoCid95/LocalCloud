import Service from "kernel/lib/Service"

export default (ClassService: typeof Service) => {
  return class Service1 extends ClassService {
    constructor(args) {
      super(args)
      console.log(this.manifest)
      console.log(this.server)
    }
  }
}