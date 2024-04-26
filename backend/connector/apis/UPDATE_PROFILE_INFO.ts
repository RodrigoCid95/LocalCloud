import type { ServerConector } from 'connector/Server'

const UPDATE_PROFILE_INFO = (server: ServerConector): Profile.UpdateMethod => (data) => server.send<void>({
  endpoint: 'profile',
  method: 'post',
  data
})

export { UPDATE_PROFILE_INFO }