import type { ServerConector } from 'connector/Server'

const MOVE_FILES_AND_DIRECTORIES = (server: ServerConector): FS.MoveMethod => (origin, dest) => server.send({
  endpoint: 'fs/move',
  method: 'post',
  data: { origin, dest }
})

export { MOVE_FILES_AND_DIRECTORIES }