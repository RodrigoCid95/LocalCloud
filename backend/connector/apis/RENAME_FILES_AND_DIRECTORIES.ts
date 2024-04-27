import type { ServerConector } from 'connector/Server'

const RENAME_FILES_AND_DIRECTORIES = (server: ServerConector): FS.RenameMethod => (path, newName) => server.send({
  endpoint: 'fs/rename',
  method: 'post',
  data: { path, newName }
})

export { RENAME_FILES_AND_DIRECTORIES }