export { };

declare global {
    namespace LocalCloud {
        interface App {
            packageName: string
            title: string
            description: string
            author: string
            extentions: string[]
        }

        interface NewUser {
            name: string
            fullName: string
            email: string
            phone: string
            password: string
        }

        interface User {
            uid: number
            name: string
            fullName: string
            email: string
            phone: string
        }

        interface Profile extends User {
            belongsToSamba: boolean
        }

        interface DataUser {
            fullName: string
            email: string
            phone: string
        }

        interface SetPasswordArgs {
            uid: number
            password: string
        }

        interface Permission {
            name: string
            description: string
            enable: boolean
        }

        interface Source {
            id: number
            url: string
            description: string
            enable: boolean
        }

        type SourceType = 	"image" | "media"| "object"| "script"| "style"| "worker"| "font"| "connect"

        interface Sources {
            [x: SourceType]: Source[]
        }

        type FileSystemRoot = "shared" | "user"

        type FileSystemEntryType = "directory" | "file"

        interface FileSystemEntry {
            type: FileSystemEntryType
            name: string
            children?: number
            size?: number
            extension?: string
        }

        interface SystemStatus {
            cpu: {
                cores: number
                usagePercent: number
                loadAverage: number[]
            }
            ram: {
                totalBytes: number
                availableBytes: number
                usedBytes: number
                usagePercent: number
            }
        }

        interface FileSystemUploadProgress {
            loaded: number
            total: number
            percent: number
            lengthComputable: boolean
        }

        interface FileSystemUploadResult {
            status: number
            message?: string
        }

        interface ControlledUpload extends EventTarget {
            readonly body: BodyInit
            readonly contentType?: string
            readonly uploading: boolean
            readonly aborted: boolean
            readonly loaded: number
            readonly total: number
            readonly percent: number
            readonly status: number
            readonly error: FileSystemUploadResult | null
            start(): Promise<FileSystemUploadResult>
            abort(): void
            addEventListener(type: "progress", listener: (event: CustomEvent<FileSystemUploadProgress>) => void, options?: boolean | AddEventListenerOptions): void
            addEventListener(type: "load", listener: (event: CustomEvent<FileSystemUploadResult>) => void, options?: boolean | AddEventListenerOptions): void
            addEventListener(type: "complete", listener: (event: CustomEvent<FileSystemUploadResult>) => void, options?: boolean | AddEventListenerOptions): void
            addEventListener(type: "error", listener: (event: CustomEvent<FileSystemUploadResult>) => void, options?: boolean | AddEventListenerOptions): void
            addEventListener(type: "abort", listener: (event: CustomEvent<FileSystemUploadResult>) => void, options?: boolean | AddEventListenerOptions): void
            addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void
        }

        interface FileSystemDownloadProgress {
            loaded: number
            total: number
            percent: number
            lengthComputable: boolean
            status: number
            blob: Blob | null
            message?: string
        }

        interface FileSystemUpload extends ControlledUpload {
            readonly root: FileSystemRoot
            readonly path: string
        }

        interface FileSystemUploadConstructor {
            new(root: FileSystemRoot, path: string, body: BodyInit, contentType?: string): FileSystemUpload
        }

        interface AppUpdateUploadOptions {
            system?: boolean
            fileName?: string
        }

        interface AppUpdateUpload extends ControlledUpload {
            readonly packageName: string
            readonly file: Blob
            readonly fileName: string
            readonly system: boolean
        }

        interface FileSystemDownload extends EventTarget {
            readonly root: FileSystemRoot
            readonly path: string
            readonly downloading: boolean
            readonly paused: boolean
            readonly canceled: boolean
            readonly loaded: number
            readonly total: number
            readonly percent: number
            readonly status: number
            readonly error: FileSystemDownloadProgress | null
            readonly blob: Blob | null
            start(): Promise<FileSystemDownloadProgress>
            pause(): void
            resume(): Promise<FileSystemDownloadProgress>
            cancel(): void
            save(fileName?: string): void
            addEventListener(type: "progress", listener: (event: CustomEvent<FileSystemDownloadProgress>) => void, options?: boolean | AddEventListenerOptions): void
            addEventListener(type: "pause", listener: (event: CustomEvent<FileSystemDownloadProgress>) => void, options?: boolean | AddEventListenerOptions): void
            addEventListener(type: "resume", listener: (event: CustomEvent<FileSystemDownloadProgress>) => void, options?: boolean | AddEventListenerOptions): void
            addEventListener(type: "complete", listener: (event: CustomEvent<FileSystemDownloadProgress>) => void, options?: boolean | AddEventListenerOptions): void
            addEventListener(type: "error", listener: (event: CustomEvent<FileSystemDownloadProgress>) => void, options?: boolean | AddEventListenerOptions): void
            addEventListener(type: "cancel", listener: (event: CustomEvent<FileSystemDownloadProgress>) => void, options?: boolean | AddEventListenerOptions): void
            addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void
        }

        interface FileSystemDownloadConstructor {
            new(root: FileSystemRoot, path: string): FileSystemDownload
        }

        interface FileSystemConnector {
            Upload: FileSystemUploadConstructor
            Download: FileSystemDownloadConstructor
            readDir(root: FileSystemRoot, path?: string): Promise<FileSystemEntry[] | null>
            readFile(root: FileSystemRoot, path: string): Promise<Blob | null>
            getFileUrl(root: FileSystemRoot, path: string): string
            getStreamUrl(root: FileSystemRoot, path: string): string
            createDownload(root: FileSystemRoot, path: string): FileSystemDownload
            createDir(root: FileSystemRoot, path: string): Promise<void>
            writeFile(root: FileSystemRoot, path: string, body: BodyInit, contentType?: string): Promise<void>
            createUpload(root: FileSystemRoot, path: string, body: BodyInit, contentType?: string): FileSystemUpload
            delete(root: FileSystemRoot, path: string): Promise<void>
            rename(root: FileSystemRoot, path: string, newName: string): Promise<void>
        }

        type AppDataValue = null | boolean | number | string | AppDataValue[] | { [key: string]: AppDataValue }

        interface AppDataScopeConnector {
            list(): Promise<string[] | null>
            get<T extends AppDataValue = AppDataValue>(key: string): Promise<T | null>
            set(key: string, value: AppDataValue): Promise<void>
            delete(key: string): Promise<void>
        }

        interface AppDataConnector {
            global: AppDataScopeConnector
            user: AppDataScopeConnector
        }

        interface AppStoreDocument<T = AppDataValue> {
            id: string
            value: T
            createdAt: string
            updatedAt: string
        }

        interface AppStoreListOptions {
            offset?: number
            limit?: number
            desc?: boolean
        }

        interface AppStoreScopeConnector {
            listCollections(): Promise<string[] | null>
            list<T = AppDataValue>(collection: string, options?: AppStoreListOptions): Promise<AppStoreDocument<T>[] | null>
            get<T = AppDataValue>(collection: string, id: string): Promise<AppStoreDocument<T> | null>
            insert(collection: string, value: unknown): Promise<string>
            put(collection: string, id: string, value: unknown): Promise<void>
            delete(collection: string, id: string): Promise<void>
            compact(collection: string): Promise<void>
        }

        interface AppStoreConnector {
            global: AppStoreScopeConnector
            user: AppStoreScopeConnector
        }

        type AppBusScope = "user" | "shared"

        type AppBusPayload = null | boolean | number | string | AppBusPayload[] | { [key: string]: AppBusPayload }

        interface AppBusConnectOptions {
            scope?: AppBusScope
            room?: string
            instanceId?: string
        }

        interface AppBusEvent {
            id: string
            packageName: string
            scope: AppBusScope
            room: string
            from: {
                uid: number
                instanceId: string
            }
            type: string
            payload: AppBusPayload
            createdAt: string
        }

        interface AppBusConnection extends EventTarget {
            readonly scope: AppBusScope
            readonly room: string
            readonly instanceId: string
            readonly socket: WebSocket | null
            readonly connected: boolean
            readonly closed: boolean
            readonly ready: Promise<AppBusConnection>
            send(type: string, payload?: AppBusPayload): void
            close(code?: number, reason?: string): void
            addEventListener(type: "message", listener: (event: CustomEvent<AppBusEvent>) => void, options?: boolean | AddEventListenerOptions): void
            addEventListener(type: "open", listener: (event: CustomEvent<Event>) => void, options?: boolean | AddEventListenerOptions): void
            addEventListener(type: "close", listener: (event: CustomEvent<CloseEvent>) => void, options?: boolean | AddEventListenerOptions): void
            addEventListener(type: "error", listener: (event: CustomEvent<Event | MessageEvent>) => void, options?: boolean | AddEventListenerOptions): void
            addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void
        }

        interface AppBusConnectionConstructor {
            new(options?: AppBusConnectOptions): AppBusConnection
        }

        interface AppBusConnector {
            Connection: AppBusConnectionConstructor
            connect(options?: AppBusConnectOptions): AppBusConnection
        }

        type NotificationPayload = null | boolean | number | string | NotificationPayload[] | { [key: string]: NotificationPayload }

        interface NotificationOpenAppPayload {
            action: "openApp"
            packageName: string
            data?: { [key: string]: null | boolean | number | string }
        }

        interface NotificationMessage {
            type: string
            title?: string
            message?: string
            payload?: NotificationPayload | NotificationOpenAppPayload
        }

        interface NotificationEvent {
            id: string
            packageName: string
            uid: number
            type: string
            title?: string
            message?: string
            payload?: NotificationPayload | NotificationOpenAppPayload
            createdAt: string
        }

        interface NotificationsStreamOptions {
            onError?: (event: Event) => void
            onPing?: (event: MessageEvent) => void
        }

        interface NotificationsConnector {
            stream(onNotification: (notification: NotificationEvent, event: MessageEvent) => void, options?: NotificationsStreamOptions): EventSource
            send(message: NotificationMessage): Promise<NotificationEvent>
            sendToUser(uid: number, message: NotificationMessage): Promise<NotificationEvent>
        }

        interface SambaConnector {
            belongsTo(uid: number): Promise<boolean>
            enable(uid: number): Promise<void>
            disable(uid: number): Promise<void>
            setPassword(uid: number, password: string): Promise<void>
        }

        interface SystemStatusOptions {
            onError?: (event: Event) => void
        }

        interface SystemConnector {
            status(onStatus: (status: SystemStatus, event: MessageEvent) => void, options?: SystemStatusOptions): EventSource
            shutdown(): Promise<void>
            reboot(): Promise<void>
        }

        interface SourceConnector {
            get(packageName: string): Promise<Sources>
            get(packageName: string, sourceType: string): Promise<Source[]>
            get(packageName: string, sourceType: string, id: number): Promise<Source>
            enable(packageName: string, sourceType: string, id: number): Promise<void>
            disable(packageName: string, sourceType: string, id: number): Promise<void>
        }

        interface PermissionsConnector {
            get(packageName: string): Promise<Permission[]>
            get(packageName: string, permission: string): Promise<Permission>
            enable(packageName: string, permission: string): Promise<void>
            disable(packageName: string, permission: string): Promise<void>
        }

        interface AssignmentsConnector {
            get(uid: number): Promise<App[]>
            add(uid: number, packageName: string): Promise<void>
            remove(uid: number, packageName: string): Promise<void>
        }

        interface UsersConnector {
            create(newUser: NewUser): Promise<void>
            getAll(): Promise<User[]>
            get(uid: number): Promise<User | null>
            update(uid: number, data: DataUser): Promise<void>
            delete(uid: number): Promise<void>
            setPassword(data: SetPasswordArgs): Promise<void>
        }

        interface ProfileConnector {
            getApps(): Promise<App[]>
            get(): Prmise<Profile>
            update(data: DataUser): Promise<void>
            setPassword(newPassword: string): Promise<void>
            setSambaPassword(newPassword: string): Promise<void>
        }

        interface AppsConnector {
            get(package_name: string): Promise<App>
            getAll(): Promise<App[]>
            update(packageName: string, file: Blob, options?: AppUpdateUploadOptions): Promise<void>
            createUpdateUpload(packageName: string, file: Blob, options?: AppUpdateUploadOptions): AppUpdateUpload
        }

        interface SDK {
            apps: AppsConnector
            profile: ProfileConnector
            users: UsersConnector
            assignments: AssignmentsConnector
            permissions: PermissionsConnector
            sources: SourceConnector
            data: AppDataConnector
            store: AppStoreConnector
            filesystem: FileSystemConnector
            bus: AppBusConnector
            notifications: NotificationsConnector
            system: SystemConnector
            samba: SambaConnector
        }
    }
    interface Window {
        sdk: LocalCloud.SDK
    }
}
