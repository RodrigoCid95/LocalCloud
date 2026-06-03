(() => {
  const getEndpoint = (endpoint, ...paths) => {
    let path = BASE_URL + endpoint
    if (path.length > 0) {
      for (const item of paths) {
        path += `/${item}`
      }
    }
    return new URL(path, location.origin)
  }

  const getRequest = opts => {
    const { endpoint, path = [], method = 'GET', data, body, query = {}, contentType } = opts
    const paths = typeof path === 'string' ? [path] : path
    const url = getEndpoint(endpoint, ...paths)
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value)
      }
    }
    const fetchOpts = { method }
    if (data !== undefined) {
      const headers = new Headers()
      headers.append('Content-Type', 'application/json')
      fetchOpts['headers'] = headers
      fetchOpts['body'] = JSON.stringify(data)
    } else if (body !== undefined) {
      if (contentType) {
        const headers = new Headers()
        headers.append('Content-Type', contentType)
        fetchOpts['headers'] = headers
      }
      fetchOpts['body'] = body
    }
    return fetch(url, fetchOpts)
  }

  const getEventSource = (endpoint, path = []) => {
    const paths = typeof path === 'string' ? [path] : path
    const url = getEndpoint(endpoint, ...paths)
    return new EventSource(url.toString(), { withCredentials: true })
  }

  const getWebSocketEndpoint = (endpoint, path = []) => {
    const paths = typeof path === 'string' ? [path] : path
    const url = getEndpoint(endpoint, ...paths)
    url.protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
    return url
  }

  const validatePackageName = (package_name) => {
    if (!package_name) {
      throw new Error("Parameter required.")
    }
    if (typeof package_name !== 'string') {
      throw new Error("Parameter type invalid.")
    }
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(package_name) || package_name === '.' || package_name === '..' || package_name.includes('/') || package_name.includes('\\')) {
      throw new Error("Parameter invalid.")
    }
  }

  const sdk = {}

  const apps = {}
  APPS_GET_ALL && Object.defineProperty(apps, 'getAll', {
    value: async () => {
      const request = await getRequest({ endpoint: 'apps' })
      const response = await request.json()
      return response
    }, writable: false
  })
  APPS_GET && Object.defineProperty(apps, 'get', {
    value: async (package_name) => {
      if (!package_name) {
        throw new Error("Parameter required.")
      }
      if (typeof package_name !== 'string') {
        throw new Error("Parameter type invalid.")
      }
      const request = await getRequest({ endpoint: 'apps', path: package_name })
      const response = await request.json()
      return response
    }, writable: false
  })
  APPS_UPDATE && Object.defineProperty(apps, 'update', {
    value: async (package_name, file, options = {}) => {
      const upload = apps.createUpdateUpload(package_name, file, options)
      await upload.start()
    }, writable: false
  })
  APPS_UPDATE && Object.defineProperty(apps, 'createUpdateUpload', {
    value: (package_name, file, options = {}) => new AppUpdateUpload(package_name, file, options),
    writable: false,
  })
  Object.defineProperty(sdk, 'apps', { value: apps, writable: false })

  const profile = {}
  PROFILE_GET && Object.defineProperty(profile, 'get', {
    value: async () => {
      const request = await getRequest({ endpoint: 'profile' })
      const response = await request.json()
      return response
    }, writable: false
  })
  PROFILE_GET_APPS && Object.defineProperty(profile, 'getApps', {
    value: async () => {
      const request = await getRequest({ endpoint: 'profile', path: 'apps' })
      const response = await request.json()
      return response
    }, writable: false
  })
  PROFILE_UPDATE && Object.defineProperty(profile, 'update', {
    value: async (data) => {
      if (!data) {
        throw new Error("Parameter required.")
      }
      const { fullName = '', email = '', phone = '' } = data
      const newData = { fullName, email, phone }
      await getRequest({ endpoint: 'profile', method: 'PUT', data: newData })
    }, writable: false
  })
  PROFILE_SET_PASSWORD && Object.defineProperty(profile, 'setPassword', {
    value: async (password) => {
      if (!password) {
        throw new Error("Parameter required.")
      }
      if (typeof password !== 'string') {
        throw new Error("Parameter type invalid.")
      }
      await getRequest({ endpoint: 'profile', path: 'set-password', method: 'PUT', data: { password } })
    }, writable: false
  })
  PROFILE_SET_SAMBA_PASSWORD && Object.defineProperty(profile, 'setSambaPassword', {
    value: async (password) => {
      if (!password) {
        throw new Error("Parameter required.")
      }
      if (typeof password !== 'string') {
        throw new Error("Parameter type invalid.")
      }
      await getRequest({ endpoint: 'profile', path: ['samba', 'set-password'], method: 'PUT', data: { password } })
    }, writable: false
  })
  Object.defineProperty(sdk, 'profile', { value: profile, writable: false })

  const users = {}
  USERS_CREATE && Object.defineProperty(users, 'create', {
    value: async (newData) => {
      if (!newData) {
        throw new Error("Parameter required.")
      }
      const { name, fullName = '', email = '', phone = '', password } = newData
      const data = { name, fullName, email, phone, password }
      await getRequest({ endpoint: 'users', method: 'POST', data })
    }, writable: false
  })
  USERS_GET_ALL && Object.defineProperty(users, 'getAll', {
    value: async () => {
      const request = await getRequest({ endpoint: 'users' })
      if (request.status !== 200) {
        return null
      }
      const response = await request.json()
      return response
    }, writable: false
  })
  USERS_GET && Object.defineProperty(users, 'get', {
    value: async (uid) => {
      if (uid === undefined) {
        throw new Error("Parameter required.")
      }
      if (typeof uid !== 'number') {
        throw new Error("Parameter type invalid.")
      }
      const request = await getRequest({ endpoint: 'users', path: uid.toString() })
      if (request.status !== 200) {
        return null
      }
      const response = await request.json()
      return response
    }, writable: false
  })
  USERS_UPDATE && Object.defineProperty(users, 'update', {
    value: async (uid, newData) => {
      if (uid === undefined) {
        throw new Error("Parameter required.")
      }
      if (typeof uid !== 'number') {
        throw new Error("Parameter type invalid.")
      }
      if (!newData) {
        throw new Error("Parameter required.")
      }
      const { fullName = '', email = '', phone = '' } = newData
      const data = { fullName, email, phone }
      await getRequest({ endpoint: 'users', path: uid.toString(), method: 'PUT', data })
    }, writable: false
  })
  USERS_DELETE && Object.defineProperty(users, 'delete', {
    value: async (uid) => {
      if (uid === undefined) {
        throw new Error("Parameter required.")
      }
      if (typeof uid !== 'number') {
        throw new Error("Parameter type invalid.")
      }
      await getRequest({ endpoint: 'users', path: uid.toString(), method: 'DELETE' })
    }, writable: false
  })
  USERS_SET_PASSWORD && Object.defineProperty(users, 'setPassword', {
    value: async ({ uid, password } = {}) => {
      if (uid === undefined) {
        throw new Error("Parameter required.")
      }
      if (typeof uid !== 'number') {
        throw new Error("Parameter type invalid.")
      }
      if (!password) {
        throw new Error("Parameter required.")
      }
      if (typeof password !== 'string') {
        throw new Error("Parameter type invalid.")
      }
      await getRequest({ endpoint: 'users', path: 'set-password', method: 'PUT', data: { uid, password } })
    }, writable: false,
  })
  Object.defineProperty(sdk, 'users', { value: users, writable: false })

  const assignments = {}
  ASSIGNMENTS_GET && Object.defineProperty(assignments, 'get', {
    value: async (uid) => {
      if (uid === undefined) {
        throw new Error("Parameter required.")
      }
      if (typeof uid !== 'number') {
        throw new Error("Parameter type invalid.")
      }
      const request = await getRequest({ endpoint: 'assignments', path: uid.toString() })
      if (request.status !== 200) {
        return null
      }
      const response = await request.json()
      return response
    }, writable: false
  })
  ASSIGNMENTS_ADD && Object.defineProperty(assignments, 'add', {
    value: async (uid, package_name) => {
      if (uid === undefined) {
        throw new Error("Parameter required.")
      }
      if (typeof uid !== 'number') {
        throw new Error("Parameter type invalid.")
      }
      if (!package_name) {
        throw new Error("Parameter required.")
      }
      if (typeof package_name !== 'string') {
        throw new Error("Parameter type invalid.")
      }
      await getRequest({ endpoint: 'assignments', path: [uid.toString(), package_name], method: 'PUT' })
    }, writable: false
  })
  ASSIGNMENTS_REMOVE && Object.defineProperty(assignments, 'remove', {
    value: async (uid, package_name) => {
      if (uid === undefined) {
        throw new Error("Parameter required.")
      }
      if (typeof uid !== 'number') {
        throw new Error("Parameter type invalid.")
      }
      if (!package_name) {
        throw new Error("Parameter required.")
      }
      if (typeof package_name !== 'string') {
        throw new Error("Parameter type invalid.")
      }
      await getRequest({ endpoint: 'assignments', path: [uid.toString(), package_name], method: 'DELETE' })
    }, writable: false
  })
  Object.defineProperty(sdk, 'assignments', { value: assignments, writable: false })

  const data = {}
  const validateAppDataKey = (key) => {
    if (!key) {
      throw new Error("Parameter required.")
    }
    if (typeof key !== 'string') {
      throw new Error("Parameter type invalid.")
    }
  }
  const createAppDataScope = (scope) => {
    const appData = {}
    Object.defineProperty(appData, 'list', {
      value: async () => {
        const request = await getRequest({ endpoint: 'data', path: scope })
        if (request.status !== 200) {
          return null
        }
        const response = await request.json()
        return response
      }, writable: false
    })
    Object.defineProperty(appData, 'get', {
      value: async (key) => {
        validateAppDataKey(key)
        const request = await getRequest({ endpoint: 'data', path: [scope, key] })
        if (request.status !== 200) {
          return null
        }
        const response = await request.json()
        return response
      }, writable: false
    })
    Object.defineProperty(appData, 'set', {
      value: async (key, value) => {
        validateAppDataKey(key)
        if (value === undefined) {
          throw new Error("Parameter required.")
        }
        await getRequest({ endpoint: 'data', path: [scope, key], method: 'PUT', data: value })
      }, writable: false
    })
    Object.defineProperty(appData, 'delete', {
      value: async (key) => {
        validateAppDataKey(key)
        await getRequest({ endpoint: 'data', path: [scope, key], method: 'DELETE' })
      }, writable: false
    })
    return appData
  }
  Object.defineProperty(data, 'global', { value: createAppDataScope('global'), writable: false })
  Object.defineProperty(data, 'user', { value: createAppDataScope('user'), writable: false })
  Object.defineProperty(sdk, 'data', { value: data, writable: false })

  const store = {}
  const validateAppStoreName = (name) => {
    if (!name) {
      throw new Error("Parameter required.")
    }
    if (typeof name !== 'string') {
      throw new Error("Parameter type invalid.")
    }
  }
  const createAppStoreScope = (scope) => {
    const appStore = {}
    APP_STORE_READ && Object.defineProperty(appStore, 'listCollections', {
      value: async () => {
        const request = await getRequest({ endpoint: 'store', path: scope })
        if (request.status !== 200) {
          return null
        }
        const response = await request.json()
        return response
      }, writable: false
    })
    APP_STORE_READ && Object.defineProperty(appStore, 'list', {
      value: async (collection, options = {}) => {
        validateAppStoreName(collection)
        const { offset, limit, desc } = options
        const request = await getRequest({ endpoint: 'store', path: [scope, collection], query: { offset, limit, desc } })
        if (request.status !== 200) {
          return null
        }
        const response = await request.json()
        return response
      }, writable: false
    })
    APP_STORE_READ && Object.defineProperty(appStore, 'get', {
      value: async (collection, id) => {
        validateAppStoreName(collection)
        validateAppStoreName(id)
        const request = await getRequest({ endpoint: 'store', path: [scope, collection, id] })
        if (request.status !== 200) {
          return null
        }
        const response = await request.json()
        return response
      }, writable: false
    })
    APP_STORE_WRITE && Object.defineProperty(appStore, 'insert', {
      value: async (collection, value) => {
        validateAppStoreName(collection)
        if (value === undefined) {
          throw new Error("Parameter required.")
        }
        const request = await getRequest({ endpoint: 'store', path: [scope, collection], method: 'POST', data: value })
        const response = await request.json()
        return response.id
      }, writable: false
    })
    APP_STORE_WRITE && Object.defineProperty(appStore, 'put', {
      value: async (collection, id, value) => {
        validateAppStoreName(collection)
        validateAppStoreName(id)
        if (value === undefined) {
          throw new Error("Parameter required.")
        }
        await getRequest({ endpoint: 'store', path: [scope, collection, id], method: 'PUT', data: value })
      }, writable: false
    })
    APP_STORE_DELETE && Object.defineProperty(appStore, 'delete', {
      value: async (collection, id) => {
        validateAppStoreName(collection)
        validateAppStoreName(id)
        await getRequest({ endpoint: 'store', path: [scope, collection, id], method: 'DELETE' })
      }, writable: false
    })
    APP_STORE_COMPACT && Object.defineProperty(appStore, 'compact', {
      value: async (collection) => {
        validateAppStoreName(collection)
        await getRequest({ endpoint: 'store', path: [scope, collection, '_compact'], method: 'POST' })
      }, writable: false
    })
    return appStore
  }
  Object.defineProperty(store, 'global', { value: createAppStoreScope('global'), writable: false })
  Object.defineProperty(store, 'user', { value: createAppStoreScope('user'), writable: false })
  Object.defineProperty(sdk, 'store', { value: store, writable: false })

  const permissions = {}
  PERMISSIONS_GET && Object.defineProperty(permissions, 'get', {
    value: async (package_name, permission) => {
      if (package_name == undefined) {
        throw new Error("Parameter required")
      }
      if (typeof package_name !== 'string') {
        throw new Error("Parameter type invalid.")
      }
      const path = [package_name]
      if (permission !== undefined) {
        if (typeof permission !== 'string') {
          throw new Error("Parameter type invalid.")
        }
        path.push(permission)
      }
      const request = await getRequest({ endpoint: 'permissions', path })
      if (request.status !== 200) {
        return null
      }
      const response = await request.json()
      return response
    }, writable: false
  })
  PERMISSIONS_ENABLE && Object.defineProperty(permissions, 'enable', {
    value: async (package_name, permission) => {
      if (package_name == undefined || permission === undefined) {
        throw new Error("Parameter required")
      }
      if (typeof package_name !== 'string' || typeof permission !== 'string') {
        throw new Error("Parameter type invalid.")
      }
      await getRequest({ endpoint: 'permissions', path: [package_name, permission, 'enable'], method: 'PUT' })
    }, writable: false
  })
  PERMISSIONS_DISABLE && Object.defineProperty(permissions, 'disable', {
    value: async (package_name, permission) => {
      if (package_name == undefined || permission === undefined) {
        throw new Error("Parameter required")
      }
      if (typeof package_name !== 'string' || typeof permission !== 'string') {
        throw new Error("Parameter type invalid.")
      }
      await getRequest({ endpoint: 'permissions', path: [package_name, permission, 'disable'], method: 'PUT' })
    }, writable: false
  })
  Object.defineProperty(sdk, 'permissions', { value: permissions, writable: false })

  const sources = {}
  SOURCES_GET && Object.defineProperty(sources, 'get', {
    value: async (package_name, source_type, id) => {
      if (package_name == undefined) {
        throw new Error("Parameter required")
      }
      if (typeof package_name !== 'string') {
        throw new Error("Parameter type invalid.")
      }
      const path = [package_name]
      if (source_type !== undefined) {
        if (typeof source_type !== 'string') {
          throw new Error("Parameter type invalid.")
        }
        path.push(source_type)
      }
      if (id !== undefined) {
        if (typeof id !== 'number') {
          throw new Error("Parameter type invalid.")
        }
        path.push(id)
      }
      const request = await getRequest({ endpoint: 'sources', path })
      if (request.status !== 200) {
        return null
      }
      const response = await request.json()
      return response
    }, writable: false
  })
  SOURCES_ENABLE && Object.defineProperty(sources, 'enable', {
    value: async (package_name, source_type, id) => {
      if (package_name == undefined) {
        throw new Error("Parameter required")
      }
      if (typeof package_name !== 'string') {
        throw new Error("Parameter type invalid.")
      }
      if (source_type === undefined) {
        throw new Error("Parameter required")
      }
      if (typeof source_type !== 'string') {
        throw new Error("Parameter type invalid.")
      }
      if (id === undefined) {
        throw new Error("Parameter required")
      }
      if (typeof id !== 'number') {
        throw new Error("Parameter type invalid.")
      }
      await getRequest({ endpoint: 'sources', path: [package_name, source_type, id, 'enable'], method: 'PUT' })
    }, writable: false
  })
  SOURCES_DISABLE && Object.defineProperty(sources, 'disable', {
    value: async (package_name, source_type, id) => {
      if (package_name == undefined) {
        throw new Error("Parameter required")
      }
      if (typeof package_name !== 'string') {
        throw new Error("Parameter type invalid.")
      }
      if (source_type === undefined) {
        throw new Error("Parameter required")
      }
      if (typeof source_type !== 'string') {
        throw new Error("Parameter type invalid.")
      }
      if (id === undefined) {
        throw new Error("Parameter required")
      }
      if (typeof id !== 'number') {
        throw new Error("Parameter type invalid.")
      }
      await getRequest({ endpoint: 'sources', path: [package_name, source_type, id, 'disable'], method: 'PUT' })
    }, writable: false
  })
  Object.defineProperty(sdk, 'sources', { value: sources, writable: false })

  const filesystem = {}
  const validateFileSystemRoot = (root) => {
    if (!root) {
      throw new Error("Parameter required.")
    }
    if (root !== 'shared' && root !== 'user') {
      throw new Error("Parameter invalid.")
    }
  }
  const validateFileSystemPath = (path) => {
    if (path === undefined) {
      throw new Error("Parameter required.")
    }
    if (typeof path !== 'string') {
      throw new Error("Parameter type invalid.")
    }
  }
  const getFileSystemFileUrl = (root, path) => {
    validateFileSystemRoot(root)
    validateFileSystemPath(path)
    const url = getEndpoint('filesystem', root, 'open')
    url.searchParams.set('path', path)
    return url.toString()
  }
  const getFileSystemStreamUrl = (root, path) => {
    validateFileSystemRoot(root)
    validateFileSystemPath(path)
    const url = getEndpoint('filesystem', root, 'stream')
    url.searchParams.set('path', path)
    return url.toString()
  }
  class ControlledUpload extends EventTarget {
    constructor(body, contentType) {
      super()
      if (body === undefined) {
        throw new Error("Parameter required.")
      }

      this.body = body
      this.contentType = contentType
      this.xhr = null
      this.uploading = false
      this.aborted = false
      this.loaded = 0
      this.total = 0
      this.percent = 0
      this.status = 0
      this.error = null
    }

    getMethod() {
      return 'PUT'
    }

    getUrl() {
      throw new Error("Not implemented.")
    }

    start() {
      if (this.uploading) {
        throw new Error("Upload already started.")
      }

      this.uploading = true
      this.aborted = false

      return new Promise((resolve, reject) => {
        const url = this.getUrl()

        const xhr = new XMLHttpRequest()
        this.xhr = xhr

        xhr.open(this.getMethod(), url.toString())
        if (this.contentType) {
          xhr.setRequestHeader('Content-Type', this.contentType)
        }

        xhr.upload.addEventListener('progress', event => {
          this.loaded = event.loaded
          this.total = event.lengthComputable ? event.total : 0
          this.percent = event.lengthComputable && event.total > 0 ? Math.round((event.loaded / event.total) * 100) : 0
          const detail = {
            loaded: this.loaded,
            total: this.total,
            percent: this.percent,
            lengthComputable: event.lengthComputable,
          }
          this.dispatchEvent(new CustomEvent('progress', { detail }))
        })

        xhr.addEventListener('load', () => {
          this.uploading = false
          this.status = xhr.status
          if (xhr.status >= 200 && xhr.status < 300) {
            const detail = { status: xhr.status }
            this.dispatchEvent(new CustomEvent('load', { detail }))
            this.dispatchEvent(new CustomEvent('complete', { detail }))
            resolve(detail)
            return
          }

          const detail = { status: xhr.status, message: xhr.statusText || 'Upload failed.' }
          this.error = detail
          this.dispatchEvent(new CustomEvent('error', { detail }))
          reject(detail)
        })

        xhr.addEventListener('error', () => {
          this.uploading = false
          this.status = xhr.status
          const detail = { status: xhr.status, message: xhr.statusText || 'Network error.' }
          this.error = detail
          this.dispatchEvent(new CustomEvent('error', { detail }))
          reject(detail)
        })

        xhr.addEventListener('abort', () => {
          this.uploading = false
          this.aborted = true
          this.status = xhr.status
          const detail = { status: xhr.status }
          this.dispatchEvent(new CustomEvent('abort', { detail }))
          reject(detail)
        })

        xhr.send(this.body)
      })
    }

    abort() {
      if (this.xhr && this.uploading) {
        this.xhr.abort()
      }
    }
  }
  class FileSystemUpload extends ControlledUpload {
    constructor(root, path, body, contentType) {
      validateFileSystemRoot(root)
      validateFileSystemPath(path)
      super(body, contentType)
      this.root = root
      this.path = path
    }

    getUrl() {
      const url = getEndpoint('filesystem', this.root, 'file')
      url.searchParams.set('path', this.path)
      return url
    }
  }
  class AppUpdateUpload extends ControlledUpload {
    constructor(package_name, file, { system = false, fileName } = {}) {
      validatePackageName(package_name)
      if (file === undefined) {
        throw new Error("Parameter required.")
      }
      if (!(file instanceof Blob)) {
        throw new Error("Parameter type invalid.")
      }
      if (typeof system !== 'boolean') {
        throw new Error("Parameter type invalid.")
      }

      const filename = fileName || file.name
      if (!filename || typeof filename !== 'string') {
        throw new Error("Parameter required.")
      }

      const formData = new FormData()
      formData.append('file', file, filename)

      super(formData)
      this.packageName = package_name
      this.file = file
      this.fileName = filename
      this.system = system
    }

    getUrl() {
      const url = getEndpoint('apps', this.packageName)
      if (this.system) {
        url.searchParams.set('system', 'true')
      }
      return url
    }
  }
  class FileSystemDownload extends EventTarget {
    constructor(root, path) {
      super()
      validateFileSystemRoot(root)
      validateFileSystemPath(path)

      this.root = root
      this.path = path
      this.controller = null
      this.chunks = []
      this.downloading = false
      this.paused = false
      this.canceled = false
      this.loaded = 0
      this.total = 0
      this.percent = 0
      this.status = 0
      this.error = null
      this.blob = null
      this.contentType = 'application/octet-stream'
      this.pauseRequested = false
      this.cancelRequested = false
    }

    start() {
      if (this.downloading) {
        throw new Error("Download already started.")
      }
      if (this.blob) {
        return Promise.resolve({ status: this.status, blob: this.blob })
      }

      return this.run()
    }

    resume() {
      if (this.downloading) {
        throw new Error("Download already started.")
      }
      if (!this.paused) {
        return this.start()
      }

      this.dispatchEvent(new CustomEvent('resume', { detail: this.createDetail() }))
      return this.run()
    }

    pause() {
      if (!this.downloading || !this.controller) {
        return
      }

      this.pauseRequested = true
      this.controller.abort()
    }

    cancel() {
      this.cancelRequested = true
      if (this.controller && this.downloading) {
        this.controller.abort()
        return
      }
      this.reset()
      this.canceled = true
      const detail = this.createDetail()
      this.dispatchEvent(new CustomEvent('cancel', { detail }))
    }

    save(fileName) {
      if (!this.blob) {
        throw new Error("Download is not complete.")
      }

      const url = URL.createObjectURL(this.blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName || this.path.split('/').pop() || 'download'
      link.click()
      URL.revokeObjectURL(url)
    }

    async run() {
      this.downloading = true
      this.paused = false
      this.canceled = false
      this.pauseRequested = false
      this.cancelRequested = false
      this.controller = new AbortController()

      const url = getEndpoint('filesystem', this.root, 'file')
      url.searchParams.set('path', this.path)
      const headers = new Headers()
      if (this.loaded > 0) {
        headers.set('Range', `bytes=${this.loaded}-`)
      }

      try {
        const response = await fetch(url, { headers, signal: this.controller.signal })
        this.status = response.status
        if (!response.ok || (this.loaded > 0 && response.status !== 206)) {
          throw { status: response.status, message: response.statusText || 'Download failed.' }
        }

        this.contentType = response.headers.get('Content-Type') || this.contentType
        this.total = this.readTotal(response)

        const reader = response.body?.getReader()
        if (!reader) {
          const blob = await response.blob()
          this.chunks.push(blob)
          this.loaded += blob.size
          this.complete()
          return this.createDetail()
        }

        while (true) {
          const result = await reader.read()
          if (result.done) {
            break
          }

          this.chunks.push(result.value)
          this.loaded += result.value.byteLength
          this.percent = this.total > 0 ? Math.round((this.loaded / this.total) * 100) : 0
          this.dispatchEvent(new CustomEvent('progress', { detail: this.createDetail() }))
        }

        this.complete()
        return this.createDetail()
      } catch (reason) {
        this.downloading = false
        this.controller = null

        if (this.pauseRequested) {
          this.paused = true
          this.pauseRequested = false
          const detail = this.createDetail()
          this.dispatchEvent(new CustomEvent('pause', { detail }))
          return detail
        }

        if (this.cancelRequested || reason?.name === 'AbortError') {
          this.reset()
          this.canceled = true
          this.cancelRequested = false
          const detail = this.createDetail()
          this.dispatchEvent(new CustomEvent('cancel', { detail }))
          return detail
        }

        const detail = {
          ...this.createDetail(),
          status: reason?.status || this.status,
          message: reason?.message || 'Download failed.',
        }
        this.error = detail
        this.dispatchEvent(new CustomEvent('error', { detail }))
        throw detail
      }
    }

    complete() {
      this.downloading = false
      this.paused = false
      this.controller = null
      this.percent = 100
      this.blob = new Blob(this.chunks, { type: this.contentType })
      const detail = this.createDetail()
      this.dispatchEvent(new CustomEvent('complete', { detail }))
    }

    reset() {
      this.controller = null
      this.chunks = []
      this.downloading = false
      this.paused = false
      this.loaded = 0
      this.total = 0
      this.percent = 0
      this.status = 0
      this.error = null
      this.blob = null
      this.pauseRequested = false
      this.cancelRequested = false
    }

    readTotal(response) {
      const contentRange = response.headers.get('Content-Range')
      if (contentRange) {
        const total = Number(contentRange.split('/').pop())
        if (Number.isFinite(total)) {
          return total
        }
      }

      const contentLength = Number(response.headers.get('Content-Length') || '0')
      if (Number.isFinite(contentLength) && contentLength > 0) {
        return this.loaded + contentLength
      }

      return this.total
    }

    createDetail() {
      return {
        loaded: this.loaded,
        total: this.total,
        percent: this.percent,
        lengthComputable: this.total > 0,
        status: this.status,
        blob: this.blob,
      }
    }
  }
  FILESYSTEM_READ_DIR && Object.defineProperty(filesystem, 'readDir', {
    value: async (root, path = '') => {
      validateFileSystemRoot(root)
      validateFileSystemPath(path)
      const request = await getRequest({ endpoint: 'filesystem', path: [root, 'dir'], query: { path } })
      if (request.status !== 200) {
        return null
      }
      const response = await request.json()
      return response
    }, writable: false
  })
  FILESYSTEM_READ_FILE && Object.defineProperty(filesystem, 'readFile', {
    value: async (root, path) => {
      validateFileSystemRoot(root)
      validateFileSystemPath(path)
      const request = await getRequest({ endpoint: 'filesystem', path: [root, 'file'], query: { path } })
      if (request.status !== 200) {
        return null
      }
      return request.blob()
    }, writable: false
  })
  FILESYSTEM_READ_FILE && Object.defineProperty(filesystem, 'getFileUrl', {
    value: getFileSystemFileUrl,
    writable: false,
  })
  FILESYSTEM_READ_FILE && Object.defineProperty(filesystem, 'getStreamUrl', {
    value: getFileSystemStreamUrl,
    writable: false,
  })
  FILESYSTEM_READ_FILE && Object.defineProperty(filesystem, 'Download', {
    value: FileSystemDownload,
    writable: false,
  })
  FILESYSTEM_READ_FILE && Object.defineProperty(filesystem, 'createDownload', {
    value: (root, path) => new FileSystemDownload(root, path),
    writable: false,
  })
  FILESYSTEM_CREATE_DIR && Object.defineProperty(filesystem, 'createDir', {
    value: async (root, path) => {
      validateFileSystemRoot(root)
      validateFileSystemPath(path)
      await getRequest({ endpoint: 'filesystem', path: [root, 'dir'], method: 'POST', data: { path } })
    }, writable: false
  })
  FILESYSTEM_WRITE_FILE && Object.defineProperty(filesystem, 'writeFile', {
    value: async (root, path, body, contentType) => {
      validateFileSystemRoot(root)
      validateFileSystemPath(path)
      if (body === undefined) {
        throw new Error("Parameter required.")
      }
      await new FileSystemUpload(root, path, body, contentType).start()
    }, writable: false
  })
  FILESYSTEM_WRITE_FILE && Object.defineProperty(filesystem, 'Upload', {
    value: FileSystemUpload,
    writable: false,
  })
  FILESYSTEM_WRITE_FILE && Object.defineProperty(filesystem, 'createUpload', {
    value: (root, path, body, contentType) => new FileSystemUpload(root, path, body, contentType),
    writable: false,
  })
  FILESYSTEM_DELETE && Object.defineProperty(filesystem, 'delete', {
    value: async (root, path) => {
      validateFileSystemRoot(root)
      validateFileSystemPath(path)
      await getRequest({ endpoint: 'filesystem', path: root, method: 'DELETE', query: { path } })
    }, writable: false
  })
  FILESYSTEM_RENAME && Object.defineProperty(filesystem, 'rename', {
    value: async (root, path, newName) => {
      validateFileSystemRoot(root)
      validateFileSystemPath(path)
      if (!newName) {
        throw new Error("Parameter required.")
      }
      if (typeof newName !== 'string') {
        throw new Error("Parameter type invalid.")
      }
      await getRequest({ endpoint: 'filesystem', path: [root, 'rename'], method: 'PUT', data: { path, newName } })
    }, writable: false
  })
  Object.defineProperty(sdk, 'filesystem', { value: filesystem, writable: false })

  const bus = {}
  const validateAppBusScope = (scope) => {
    if (scope !== 'user' && scope !== 'shared') {
      throw new Error("Parameter invalid.")
    }
  }
  const validateAppBusName = (name, value) => {
    if (!value) {
      throw new Error("Parameter required.")
    }
    if (typeof value !== 'string') {
      throw new Error("Parameter type invalid.")
    }
    if (value.length > 256) {
      throw new Error(`${name} invalid.`)
    }
  }
  class AppBusConnection extends EventTarget {
    constructor({ scope = 'user', room = 'default', instanceId } = {}) {
      super()
      validateAppBusScope(scope)
      validateAppBusName('room', room)
      if (instanceId !== undefined) {
        validateAppBusName('instanceId', instanceId)
      }

      this.scope = scope
      this.room = room
      this.instanceId = instanceId || AppBusConnection.createInstanceId()
      this.socket = null
      this.connected = false
      this.closed = false
      this.ready = this.open()
    }

    static createInstanceId() {
      if (crypto?.randomUUID) {
        return crypto.randomUUID()
      }
      return `${Date.now()}-${Math.random().toString(16).slice(2)}`
    }

    open() {
      const url = getWebSocketEndpoint('bus', 'ws')
      url.searchParams.set('scope', this.scope)
      url.searchParams.set('room', this.room)
      url.searchParams.set('instanceId', this.instanceId)

      this.socket = new WebSocket(url)
      this.socket.addEventListener('message', event => this.handleMessage(event))
      this.socket.addEventListener('close', event => {
        this.connected = false
        this.closed = true
        this.dispatchEvent(new CustomEvent('close', { detail: event }))
      })
      this.socket.addEventListener('error', event => {
        this.dispatchEvent(new CustomEvent('error', { detail: event }))
      })

      return new Promise((resolve, reject) => {
        const onOpen = event => {
          this.connected = true
          this.dispatchEvent(new CustomEvent('open', { detail: event }))
          resolve(this)
        }
        const onError = event => {
          reject(event)
        }
        this.socket.addEventListener('open', onOpen, { once: true })
        this.socket.addEventListener('error', onError, { once: true })
      })
    }

    send(type, payload = null) {
      validateAppBusName('type', type)
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        throw new Error("App bus connection is not open.")
      }
      this.socket.send(JSON.stringify({ type, payload }))
    }

    close(code, reason) {
      if (this.socket) {
        this.socket.close(code, reason)
      }
    }

    handleMessage(event) {
      let message
      try {
        message = JSON.parse(event.data)
      } catch {
        this.dispatchEvent(new CustomEvent('error', { detail: event }))
        return
      }

      this.dispatchEvent(new CustomEvent('message', { detail: message }))
      if (message.type) {
        this.dispatchEvent(new CustomEvent(message.type, { detail: message }))
      }
    }
  }
  APP_BUS_CONNECT && Object.defineProperty(bus, 'Connection', {
    value: AppBusConnection,
    writable: false,
  })
  APP_BUS_CONNECT && Object.defineProperty(bus, 'connect', {
    value: (options = {}) => new AppBusConnection(options),
    writable: false,
  })
  Object.defineProperty(sdk, 'bus', { value: bus, writable: false })

  const notifications = {}
  const validateNotificationMessage = (message) => {
    if (!message) {
      throw new Error("Parameter required.")
    }
    if (typeof message !== 'object') {
      throw new Error("Parameter type invalid.")
    }
    if (!message.type) {
      throw new Error("Parameter required.")
    }
    if (typeof message.type !== 'string') {
      throw new Error("Parameter type invalid.")
    }
    if (message.title !== undefined && typeof message.title !== 'string') {
      throw new Error("Parameter type invalid.")
    }
    if (message.message !== undefined && typeof message.message !== 'string') {
      throw new Error("Parameter type invalid.")
    }
  }
  NOTIFICATIONS_STREAM && Object.defineProperty(notifications, 'stream', {
    value: (onNotification, { onError, onPing } = {}) => {
      if (typeof onNotification !== 'function') {
        throw new Error("Parameter type invalid.")
      }
      if (onError !== undefined && typeof onError !== 'function') {
        throw new Error("Parameter type invalid.")
      }
      if (onPing !== undefined && typeof onPing !== 'function') {
        throw new Error("Parameter type invalid.")
      }

      const source = getEventSource('notifications', 'stream')
      source.addEventListener('notification', event => {
        onNotification(JSON.parse(event.data), event)
      })
      if (onPing) {
        source.addEventListener('ping', onPing)
      }
      if (onError) {
        source.addEventListener('error', onError)
      }

      return source
    }, writable: false
  })
  NOTIFICATIONS_SEND && Object.defineProperty(notifications, 'send', {
    value: async (message) => {
      validateNotificationMessage(message)
      const request = await getRequest({ endpoint: 'notifications', method: 'POST', data: message })
      if (!request.ok) {
        throw new Error(request.statusText || 'Notification failed.')
      }
      return request.json()
    }, writable: false
  })
  NOTIFICATIONS_SEND && Object.defineProperty(notifications, 'sendToUser', {
    value: async (uid, message) => {
      if (uid === undefined) {
        throw new Error("Parameter required.")
      }
      if (typeof uid !== 'number') {
        throw new Error("Parameter type invalid.")
      }
      validateNotificationMessage(message)
      const request = await getRequest({ endpoint: 'notifications', path: ['users', uid.toString()], method: 'POST', data: message })
      if (!request.ok) {
        throw new Error(request.statusText || 'Notification failed.')
      }
      return request.json()
    }, writable: false
  })
  Object.defineProperty(sdk, 'notifications', { value: notifications, writable: false })

  const system = {}
  SYSTEM_STATUS_GET && Object.defineProperty(system, 'status', {
    value: (onStatus, { onError } = {}) => {
      if (typeof onStatus !== 'function') {
        throw new Error("Parameter type invalid.")
      }
      if (onError !== undefined && typeof onError !== 'function') {
        throw new Error("Parameter type invalid.")
      }

      const source = getEventSource('system', 'status')
      source.addEventListener('status', event => {
        onStatus(JSON.parse(event.data), event)
      })
      if (onError) {
        source.addEventListener('error', onError)
      }

      return source
    }, writable: false
  })
  SYSTEM_SHUTDOWN && Object.defineProperty(system, 'shutdown', {
    value: async () => {
      const request = await getRequest({ endpoint: 'system', path: 'shutdown', method: 'POST' })
      if (!request.ok) {
        throw new Error(request.statusText || 'Shutdown failed.')
      }
    }, writable: false
  })
  SYSTEM_REBOOT && Object.defineProperty(system, 'reboot', {
    value: async () => {
      const request = await getRequest({ endpoint: 'system', path: 'reboot', method: 'POST' })
      if (!request.ok) {
        throw new Error(request.statusText || 'Reboot failed.')
      }
    }, writable: false
  })
  Object.defineProperty(sdk, 'system', { value: system, writable: false })

  const samba = {}
  SAMBA_BELONGS_TO && Object.defineProperty(samba, 'belongsTo', {
    value: async (uid) => {
      if (uid === undefined) {
        throw new Error("Parameter required.")
      }
      if (typeof uid !== 'number') {
        throw new Error("Parameter type invalid.")
      }
      const request = await getRequest({ endpoint: 'samba', path: uid.toString() })
      if (request.status !== 200) {
        return null
      }
      const response = await request.json()
      return response
    }, writable: false
  })
  SAMBA_ENABLE && Object.defineProperty(samba, 'enable', {
    value: async (uid) => {
      if (uid === undefined) {
        throw new Error("Parameter required.")
      }
      if (typeof uid !== 'number') {
        throw new Error("Parameter type invalid.")
      }
      await getRequest({ endpoint: 'samba', path: [uid.toString(), 'enable'], method: 'POST' })
    }, writable: false
  })
  SAMBA_DISABLE && Object.defineProperty(samba, 'disable', {
    value: async (uid) => {
      if (uid === undefined) {
        throw new Error("Parameter required.")
      }
      if (typeof uid !== 'number') {
        throw new Error("Parameter type invalid.")
      }
      await getRequest({ endpoint: 'samba', path: [uid.toString(), 'disable'], method: 'POST' })
    }, writable: false
  })
  SAMBA_SET_PASSWORD && Object.defineProperty(samba, 'setPassword', {
    value: async (uid, password) => {
      if (uid === undefined) {
        throw new Error("Parameter required.")
      }
      if (typeof uid !== 'number') {
        throw new Error("Parameter type invalid.")
      }
      if (!password) {
        throw new Error("Parameter required.")
      }
      if (typeof password !== 'string') {
        throw new Error("Parameter type invalid.")
      }
      await getRequest({ endpoint: 'samba', path: [uid.toString(), 'set-password'], method: 'PUT', data: { password } })
    }, writable: false
  })
  Object.defineProperty(sdk, 'samba', { value: samba, writable: false })

  Object.defineProperty(window, 'sdk', { value: sdk, writable: false })
})()
