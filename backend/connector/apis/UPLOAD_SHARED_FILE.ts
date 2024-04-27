import type { ServerConector } from 'connector/Server'

const UPLOAD_SHARED_FILE = (server: ServerConector): FS.SharedUploadMethod => ({ path, file }) => server.createUploader({
  api: 'fs',
  path: ['shared', ...path],
  file: { name: file.name, file }
})

export { UPLOAD_SHARED_FILE }