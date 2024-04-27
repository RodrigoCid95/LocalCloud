import type { ServerConector } from 'connector/Server'

const UPLOAD_USER_FILE = (server: ServerConector): FS.UserUploadMethod => ({ path, file }) => server.createUploader({
  api: 'fs',
  path: ['user', ...path],
  file: { name: file.name, file }
})

export { UPLOAD_USER_FILE }