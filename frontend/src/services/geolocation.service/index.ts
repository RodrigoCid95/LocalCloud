import Service from "kernel/lib/Service"

export default (ClassService: typeof Service) => {
  return class GeolocationService extends ClassService {
    constructor(args) {
      super(args)
      console.log(this.manifest)
      console.log(this.server)
    }
  }
}