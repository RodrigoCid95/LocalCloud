import type { ServerConector } from 'connector/Server'

const COPY_FILES_AND_DIRECTORIES = (server: ServerConector): FS.CopyMethod => (origin, dest) => server.send({
  endpoint: 'fs/copy',
  method: 'post',
  data: { origin, dest }
})

export { COPY_FILES_AND_DIRECTORIES }