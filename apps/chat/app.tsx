import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Avatar,
  Badge,
  Body1,
  Button,
  Caption1,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  FluentProvider,
  Input,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Spinner,
  Subtitle2,
  Text,
  Title1,
  makeStaticStyles,
  makeStyles,
  mergeClasses,
  tokens,
  webDarkTheme,
  webLightTheme,
} from '@fluentui/react-components'
import {
  AddRegular,
  ChatMultipleRegular,
  DeleteRegular,
  DismissRegular,
  NavigationRegular,
  PeopleRegular,
  SendRegular,
} from '@fluentui/react-icons'
import newMessageSoundUrl from './new-message.wav'

type ChatMessage = {
  id: string
  chatId: string
  fromUid: number
  toUid: number
  body: string
  createdAt: string
}

type ChatRecord = {
  id: string
  participantUids: number[]
  updatedAt: string
  lastMessage?: ChatMessage
  messages: ChatMessage[]
}

type ChatThread = Omit<ChatRecord, 'messages'>

type UnreadRecord = Record<string, number>

type PresencePayload = {
  uid: number
  name: string
  fullName: string
  at: string
}

type MessagePayload = {
  message: ChatMessage
}

type MessageAckPayload = {
  messageId: string
  chatId: string
  fromUid: number
  toUid: number
}

type PendingAck = {
  timeout: number
  resolve: (received: boolean) => void
}

type ChatBusConnection = LocalCloud.AppBusConnection & {
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions): void
}

const useGlobalStyles = makeStaticStyles({
  '*': {
    boxSizing: 'border-box',
  },
  body: {
    margin: 0,
    minWidth: '100vw',
    minHeight: '100vh',
    overflow: 'hidden',
    backgroundColor: '#f4f7fb',
    backgroundImage: 'linear-gradient(135deg, rgba(0, 120, 212, .10), rgba(16, 124, 16, .07) 45%, rgba(196, 49, 75, .08))',

    '@media (prefers-color-scheme: dark)': {
      backgroundColor: '#111827',
    },
  },
  '#root': {
    display: 'contents',
  },
})

const useStyles = makeStyles({
  shell: {
    width: '100%',
    maxWidth: '1180px',
    height: '100vh',
    marginRight: 'auto',
    marginLeft: 'auto',
    display: 'grid',
    gridTemplateColumns: '340px minmax(0, 1fr)',
    color: tokens.colorNeutralForeground1,
    backgroundColor: tokens.colorNeutralBackground2,
    backgroundImage: 'linear-gradient(135deg, rgba(0, 120, 212, .10), rgba(16, 124, 16, .07) 45%, rgba(196, 49, 75, .08))',

    '@media (max-width: 760px)': {
      gridTemplateColumns: '1fr',
      gridTemplateRows: 'minmax(0, 1fr)',
      height: '100dvh',
    },
  },
  sidebar: {
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    borderRightWidth: '1px',
    borderRightStyle: 'solid',
    borderRightColor: tokens.colorNeutralStroke2,
    backgroundColor: tokens.colorNeutralBackgroundAlpha,
    backdropFilter: 'blur(16px)',

    '@media (max-width: 760px)': {
      width: 'min(86vw, 340px)',
      position: 'fixed',
      top: 0,
      bottom: 0,
      left: 0,
      zIndex: 3,
      boxShadow: tokens.shadow28,
      transform: 'translateX(-105%)',
      transitionDuration: tokens.durationNormal,
      transitionProperty: 'transform',
      transitionTimingFunction: tokens.curveEasyEase,
    },
  },
  sidebarOpen: {
    '@media (max-width: 760px)': {
      transform: 'translateX(0)',
    },
  },
  mobileOverlay: {
    display: 'none',

    '@media (max-width: 760px)': {
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 2,
      display: 'block',
      backgroundColor: 'rgba(0, 0, 0, .38)',
    },
  },
  mobileOnlyButton: {
    display: 'none',

    '@media (max-width: 760px)': {
      display: 'inline-flex',
    },
  },
  sidebarHeader: {
    display: 'grid',
    gap: '18px',
    padding: '24px',
  },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  brandIcon: {
    width: '44px',
    height: '44px',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '8px',
    color: tokens.colorNeutralForegroundOnBrand,
    backgroundColor: tokens.colorBrandBackground,
    fontSize: '24px',
  },
  chatList: {
    minHeight: 0,
    overflowY: 'auto',
    display: 'grid',
    alignContent: 'start',
    gap: '6px',
    paddingRight: '14px',
    paddingBottom: '18px',
    paddingLeft: '14px',
  },
  chatItem: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: '4px',
  },
  chatButton: {
    width: '100%',
    minHeight: '64px',
    justifyContent: 'flex-start',
    gap: '0',
    paddingTop: '8px',
    paddingRight: '10px',
    paddingBottom: '8px',
    paddingLeft: '10px',
    borderRadius: '8px',
  },
  chatButtonActive: {
    backgroundColor: tokens.colorNeutralBackground1Selected,
  },
  deleteChatButton: {
    minWidth: '36px',
    height: '36px',
  },
  chatButtonInner: {
    width: '100%',
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr)',
    alignItems: 'center',
    gap: '12px',
  },
  chatButtonContent: {
    minWidth: 0,
    flex: 1,
    display: 'grid',
    gap: '2px',
    textAlign: 'left',
  },
  chatMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  truncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  emptyList: {
    minHeight: '220px',
    display: 'grid',
    placeItems: 'center',
    padding: '20px',
    textAlign: 'center',
    color: tokens.colorNeutralForeground2,
    borderTopWidth: '1px',
    borderRightWidth: '1px',
    borderBottomWidth: '1px',
    borderLeftWidth: '1px',
    borderTopStyle: 'dashed',
    borderRightStyle: 'dashed',
    borderBottomStyle: 'dashed',
    borderLeftStyle: 'dashed',
    borderTopColor: tokens.colorNeutralStroke1,
    borderRightColor: tokens.colorNeutralStroke1,
    borderBottomColor: tokens.colorNeutralStroke1,
    borderLeftColor: tokens.colorNeutralStroke1,
    borderRadius: '8px',
    backgroundColor: tokens.colorNeutralBackgroundAlpha,
  },
  content: {
    minWidth: 0,
    minHeight: 0,
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr) auto',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  mobileTopBar: {
    display: 'none',

    '@media (max-width: 760px)': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      padding: '14px 16px',
      borderBottomWidth: '1px',
      borderBottomStyle: 'solid',
      borderBottomColor: tokens.colorNeutralStroke2,
      backgroundColor: tokens.colorNeutralBackgroundAlpha,
      backdropFilter: 'blur(16px)',
    },
  },
  mobileBarActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '14px',
    padding: '18px 22px',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.colorNeutralStroke2,
  },
  headerUser: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: tokens.colorNeutralForeground2,
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '999px',
    backgroundColor: tokens.colorNeutralForeground4,
  },
  statusOnline: {
    backgroundColor: tokens.colorPaletteGreenForeground1,
  },
  messages: {
    minHeight: 0,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '22px',
  },
  messageRow: {
    display: 'flex',
  },
  messageMine: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: 'min(620px, 78%)',
    display: 'grid',
    gap: '5px',
    padding: '10px 12px',
    borderRadius: '8px',
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground1,
    overflowWrap: 'anywhere',
  },
  bubbleMine: {
    color: tokens.colorNeutralForegroundOnBrand,
    backgroundColor: tokens.colorBrandBackground,
  },
  composer: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: '10px',
    padding: '16px 22px',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: tokens.colorNeutralStroke2,
    backgroundColor: tokens.colorNeutralBackgroundAlpha,
  },
  center: {
    width: '100vw',
    height: '100vh',
    display: 'grid',
    placeItems: 'center',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  placeholder: {
    minHeight: 0,
    display: 'grid',
    placeItems: 'center',
    padding: '24px',
    textAlign: 'center',
    color: tokens.colorNeutralForeground2,
  },
  dialogList: {
    maxHeight: '420px',
    overflowY: 'auto',
    display: 'grid',
    gap: '8px',
  },
  userButton: {
    width: '100%',
    justifyContent: 'flex-start',
    minHeight: '58px',
    gap: '0',
  },
  error: {
    margin: '16px 22px 0',
  },
  dialogForm: {
    display: 'grid',
    gap: '14px',
    minWidth: '320px',

    '@media (max-width: 480px)': {
      minWidth: '0',
    },
  },
})

const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
const onlineThresholdMs = 35000
const presenceIntervalMs = 15000

const createId = () => {
  if (crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const chatIdFor = (uidA: number, uidB: number) => {
  const [a, b] = [uidA, uidB].sort((left, right) => left - right)
  return `dm.${a}.${b}`
}

const chatsCollection = 'chats'
const unreadCollection = 'unread'
const recentMessagesLimit = 200
const messageAckTimeoutMs = 3500
const userLabel = (user?: Pick<LocalCloud.User, 'name' | 'fullName'>) => user?.fullName || user?.name || 'Usuario'
const messagesCollection = (chatId: string) => `messages.${chatId}`

const readChatThread = async (chatId: string): Promise<ChatThread | null> => {
  const doc = await window.sdk.store.global.get<ChatThread>(chatsCollection, chatId)
  return doc?.value ?? null
}

const writeChatThread = async (chat: ChatThread) => {
  await window.sdk.store.global.put(chatsCollection, chat.id, chat)
}

const readMessages = async (chatId: string): Promise<ChatMessage[]> => {
  const records = await window.sdk.store.global.list<ChatMessage>(
    messagesCollection(chatId),
    { desc: true, limit: recentMessagesLimit },
  ) ?? []
  return records
    .map(record => record.value)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
}

const writeMessage = async (message: ChatMessage) => {
  await window.sdk.store.global.put(messagesCollection(message.chatId), message.id, message)
}

const deleteChatData = async (chat: ChatRecord) => {
  const messages = await window.sdk.store.global.list<ChatMessage>(messagesCollection(chat.id)) ?? []
  await Promise.all(messages.map(message => (
    window.sdk.store.global.delete(messagesCollection(chat.id), message.id)
  )))
  await window.sdk.store.global.delete(chatsCollection, chat.id)

  await Promise.all(chat.participantUids.map(async uid => {
    const nextUnread = await readUnread(uid)
    if (!nextUnread[chat.id]) {
      return
    }
    delete nextUnread[chat.id]
    await writeUnread(uid, nextUnread)
  }))
}

const readUnread = async (uid: number): Promise<UnreadRecord> => {
  const doc = await window.sdk.store.global.get<UnreadRecord>(unreadCollection, uid.toString())
  return doc?.value ?? {}
}

const writeUnread = async (uid: number, unread: UnreadRecord) => {
  await window.sdk.store.global.put(unreadCollection, uid.toString(), unread)
}

const urlChatTarget = () => {
  const params = new URLSearchParams(location.search)
  return params.get('uid') || params.get('user') || params.get('username') || params.get('name') || ''
}

const clearUrlChatTarget = () => {
  const params = new URLSearchParams(location.search)
  params.delete('uid')
  params.delete('user')
  params.delete('username')
  params.delete('name')

  const nextUrl = `${location.pathname}${params.toString() ? `?${params.toString()}` : ''}${location.hash}`
  history.replaceState(history.state, '', nextUrl)
}

const findUrlChatUser = (users: LocalCloud.User[], currentProfile: LocalCloud.Profile) => {
  const target = urlChatTarget().trim()
  if (!target) {
    return undefined
  }

  const targetUid = Number(target)
  if (Number.isInteger(targetUid)) {
    return users.find(user => user.uid === targetUid && user.uid !== currentProfile.uid)
  }

  const normalizedTarget = target.toLowerCase()
  return users.find(user => (
    user.uid !== currentProfile.uid &&
    user.name.toLowerCase() === normalizedTarget
  ))
}

const buildChat = async (currentProfile: LocalCloud.Profile, user: LocalCloud.User): Promise<ChatRecord> => {
  const chatId = chatIdFor(currentProfile.uid, user.uid)
  let thread = await readChatThread(chatId)
  if (!thread) {
    thread = {
      id: chatId,
      participantUids: [currentProfile.uid, user.uid].sort((left, right) => left - right),
      updatedAt: new Date().toISOString(),
    }
    await writeChatThread(thread)
  }

  return {
    ...thread,
    messages: await readMessages(chatId),
  }
}

const asAppBusPayload = (value: unknown): LocalCloud.AppBusPayload => value as LocalCloud.AppBusPayload
const closingBusConnections = new WeakSet<ChatBusConnection>()

const closeBusConnection = (connection: ChatBusConnection) => {
  closingBusConnections.add(connection)

  if (connection.socket?.readyState === WebSocket.CONNECTING) {
    connection.ready
      .then(() => connection.close())
      .catch(() => undefined)
    return
  }

  connection.close()
}

const App = () => {
  useGlobalStyles()
  const styles = useStyles()
  const [theme, setTheme] = useState(darkModeQuery.matches ? webDarkTheme : webLightTheme)
  const [profile, setProfile] = useState<LocalCloud.Profile | null>(null)
  const [users, setUsers] = useState<LocalCloud.User[]>([])
  const [chats, setChats] = useState<ChatRecord[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string>('')
  const [unread, setUnread] = useState<UnreadRecord>({})
  const [onlineUsers, setOnlineUsers] = useState<Record<number, number>>({})
  const [newChatOpen, setNewChatOpen] = useState<boolean>(false)
  const [chatToDelete, setChatToDelete] = useState<ChatRecord | null>(null)
  const [deletingChat, setDeletingChat] = useState<boolean>(false)
  const [deleteChatError, setDeleteChatError] = useState<string>('')
  const [conversationPanelOpen, setConversationPanelOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [draft, setDraft] = useState<string>('')
  const messageEndRef = useRef<HTMLDivElement | null>(null)
  const inboxBusRef = useRef<ChatBusConnection | null>(null)
  const presenceBusRef = useRef<ChatBusConnection | null>(null)
  const selectedChatIdRef = useRef<string>('')
  const pendingAcksRef = useRef<Map<string, PendingAck>>(new Map())
  const newMessageAudioRef = useRef<HTMLAudioElement | null>(null)
  const newMessageAudioContextRef = useRef<AudioContext | null>(null)
  const newMessageAudioBufferRef = useRef<AudioBuffer | null>(null)
  const newMessageAudioBufferPromiseRef = useRef<Promise<AudioBuffer | null> | null>(null)
  const newMessageSoundUnlockedRef = useRef<boolean>(false)

  const usersByUid = useMemo(() => {
    const entries = users.map(user => [user.uid, user] as const)
    if (profile) {
      entries.push([profile.uid, profile])
    }
    return new Map<number, Pick<LocalCloud.User, 'uid' | 'name' | 'fullName' | 'email' | 'phone'>>(entries)
  }, [profile, users])

  const selectedChat = chats.find(chat => chat.id === selectedChatId)
  const selectedPeerUid = selectedChat?.participantUids.find(uid => uid !== profile?.uid)
  const selectedPeer = selectedPeerUid ? usersByUid.get(selectedPeerUid) : undefined

  useEffect(() => {
    selectedChatIdRef.current = selectedChatId
  }, [selectedChatId])

  const isOnline = useCallback((uid: number) => {
    if (uid === profile?.uid) {
      return true
    }
    const lastSeen = onlineUsers[uid]
    return lastSeen !== undefined && Date.now() - lastSeen < onlineThresholdMs
  }, [onlineUsers, profile?.uid])

  const loadChats = useCallback(async (currentProfile: LocalCloud.Profile) => {
    const records = await window.sdk.store.global.list<ChatThread>(chatsCollection, { desc: true }) ?? []
    const currentChats = records
      .map(record => record.value)
      .filter((chat): chat is ChatThread => Boolean(chat.participantUids.includes(currentProfile.uid)))
      .map(chat => ({
        ...chat,
        messages: chat.lastMessage ? [chat.lastMessage] : [],
      }))
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))

    setChats(currentChats)
    setSelectedChatId(current => current || currentChats[0]?.id || '')
    return currentChats
  }, [])

  const loadApp = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [currentProfile, userList] = await Promise.all([
        window.sdk.profile.get(),
        window.sdk.users.getAll(),
      ])
      setProfile(currentProfile)
      setUsers(userList ?? [])
      const currentUnread = await readUnread(currentProfile.uid)
      setUnread(currentUnread)
      await loadChats(currentProfile)

      const target = urlChatTarget()
      const urlUser = findUrlChatUser(userList ?? [], currentProfile)
      if (target) {
        clearUrlChatTarget()
      }
      if (target && !urlUser) {
        setError('No se encontro el usuario indicado en la URL.')
        return
      }
      if (urlUser) {
        const chat = await buildChat(currentProfile, urlUser)
        setChats(current => [chat, ...current.filter(item => item.id !== chat.id)])
        setSelectedChatId(chat.id)
        setConversationPanelOpen(false)

        if (currentUnread[chat.id]) {
          const nextUnread = { ...currentUnread }
          delete nextUnread[chat.id]
          setUnread(nextUnread)
          await writeUnread(currentProfile.uid, nextUnread)
        }
      }
    } catch (reason) {
      console.error(reason)
      setError('No se pudo cargar el chat.')
    } finally {
      setLoading(false)
    }
  }, [loadChats])

  const mergeMessage = useCallback((message: ChatMessage) => {
    setChats(current => {
      const existing = current.find(chat => chat.id === message.chatId)
      const nextChat: ChatRecord = existing
        ? {
          ...existing,
          lastMessage: message,
          messages: existing.messages.some(item => item.id === message.id)
            ? existing.messages
            : [...existing.messages, message],
          updatedAt: message.createdAt,
        }
        : {
          id: message.chatId,
          participantUids: [message.fromUid, message.toUid].sort((left, right) => left - right),
          updatedAt: message.createdAt,
          lastMessage: message,
          messages: [message],
        }

      return [nextChat, ...current.filter(chat => chat.id !== message.chatId)]
    })
  }, [])

  const clearUnread = useCallback(async (chatId: string) => {
    if (!profile || !unread[chatId]) {
      return
    }
    const nextUnread = { ...unread }
    delete nextUnread[chatId]
    setUnread(nextUnread)
    await writeUnread(profile.uid, nextUnread)
  }, [profile, unread])

  const addUnread = useCallback(async (chatId: string) => {
    if (!profile) {
      return
    }

    setUnread(current => {
      const nextUnread = {
        ...current,
        [chatId]: (current[chatId] ?? 0) + 1,
      }
      writeUnread(profile.uid, nextUnread).catch(reason => {
        console.error(reason)
        setError('No se pudo guardar el contador de mensajes no leidos.')
      })
      return nextUnread
    })
  }, [profile])

  const createNewMessageAudio = useCallback(() => {
    const audio = new Audio(newMessageSoundUrl)
    audio.preload = 'auto'
    audio.volume = 1
    return audio
  }, [])

  const getNewMessageAudioContext = useCallback(() => {
    if (newMessageAudioContextRef.current) {
      return newMessageAudioContextRef.current
    }

    const AudioContextConstructor = window.AudioContext ?? (
      window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }
    ).webkitAudioContext

    if (!AudioContextConstructor) {
      return null
    }

    newMessageAudioContextRef.current = new AudioContextConstructor()
    return newMessageAudioContextRef.current
  }, [])

  const decodeNewMessageSound = useCallback(() => {
    if (newMessageAudioBufferRef.current) {
      return Promise.resolve(newMessageAudioBufferRef.current)
    }

    if (newMessageAudioBufferPromiseRef.current) {
      return newMessageAudioBufferPromiseRef.current
    }

    const audioContext = getNewMessageAudioContext()
    if (!audioContext) {
      return Promise.resolve(null)
    }

    const [, base64Sound = ''] = newMessageSoundUrl.split(',')
    const binarySound = atob(base64Sound)
    const soundBytes = new Uint8Array(binarySound.length)
    for (let index = 0; index < binarySound.length; index++) {
      soundBytes[index] = binarySound.charCodeAt(index)
    }

    const soundBuffer = soundBytes.buffer.slice(
      soundBytes.byteOffset,
      soundBytes.byteOffset + soundBytes.byteLength,
    ) as ArrayBuffer

    newMessageAudioBufferPromiseRef.current = audioContext.decodeAudioData(soundBuffer)
      .then(audioBuffer => {
        newMessageAudioBufferRef.current = audioBuffer
        return audioBuffer
      })
      .catch(reason => {
        console.warn('No se pudo preparar el sonido de nuevo mensaje.', reason)
        return null
      })

    return newMessageAudioBufferPromiseRef.current
  }, [getNewMessageAudioContext])

  const playNewMessageSoundFallback = useCallback(() => {
    if (!newMessageAudioRef.current) {
      newMessageAudioRef.current = createNewMessageAudio()
    }

    const audio = newMessageAudioRef.current.paused
      ? newMessageAudioRef.current
      : createNewMessageAudio()

    audio.currentTime = 0
    audio.play().catch(reason => {
      console.warn('No se pudo reproducir el sonido de nuevo mensaje.', reason)
    })
  }, [createNewMessageAudio])

  const playNewMessageSound = useCallback(() => {
    const audioContext = getNewMessageAudioContext()
    if (!audioContext) {
      playNewMessageSoundFallback()
      return
    }

    audioContext.resume()
      .then(() => decodeNewMessageSound())
      .then(audioBuffer => {
        if (!audioBuffer) {
          playNewMessageSoundFallback()
          return
        }

        const source = audioContext.createBufferSource()
        const gain = audioContext.createGain()
        gain.gain.value = 1
        source.buffer = audioBuffer
        source.connect(gain)
        gain.connect(audioContext.destination)
        source.start()
      })
      .catch(reason => {
        console.warn('No se pudo reproducir el sonido de nuevo mensaje.', reason)
        playNewMessageSoundFallback()
      })
  }, [decodeNewMessageSound, getNewMessageAudioContext, playNewMessageSoundFallback])

  const openDeleteChat = useCallback((chat: ChatRecord) => {
    setChatToDelete(chat)
    setDeleteChatError('')
  }, [])

  const closeDeleteChat = useCallback(() => {
    if (deletingChat) {
      return
    }
    setChatToDelete(null)
    setDeleteChatError('')
  }, [deletingChat])

  const deleteChat = useCallback(async () => {
    if (!chatToDelete) {
      return
    }

    setDeletingChat(true)
    setDeleteChatError('')

    try {
      await deleteChatData(chatToDelete)
      setChats(current => {
        const nextChats = current.filter(chat => chat.id !== chatToDelete.id)
        setSelectedChatId(currentSelected => (
          currentSelected === chatToDelete.id
            ? nextChats[0]?.id ?? ''
            : currentSelected
        ))
        return nextChats
      })
      setUnread(current => {
        if (!current[chatToDelete.id]) {
          return current
        }
        const nextUnread = { ...current }
        delete nextUnread[chatToDelete.id]
        return nextUnread
      })
      setChatToDelete(null)
    } catch (reason) {
      console.error(reason)
      setDeleteChatError('No se pudo eliminar la conversacion.')
    } finally {
      setDeletingChat(false)
    }
  }, [chatToDelete])

  const startChat = useCallback(async (user: LocalCloud.User) => {
    if (!profile) {
      return
    }

    const chat = await buildChat(profile, user)

    setChats(current => [chat, ...current.filter(item => item.id !== chat.id)])
    setSelectedChatId(chat.id)
    setNewChatOpen(false)
    setConversationPanelOpen(false)
    await clearUnread(chat.id)
  }, [clearUnread, profile])

  const publishToUserRoom = useCallback(async (uid: number, type: string, payload: LocalCloud.AppBusPayload) => {
    if (inboxBusRef.current && uid === profile?.uid) {
      await inboxBusRef.current.ready
      inboxBusRef.current.send(type, payload)
      return
    }

    const connection = window.sdk.bus.connect({ scope: 'shared', room: `user:${uid}` }) as ChatBusConnection
    await connection.ready
    connection.send(type, payload)
    window.setTimeout(() => connection.close(), 250)
  }, [profile?.uid])

  const waitForMessageAck = useCallback((messageId: string) => (
    new Promise<boolean>(resolve => {
      const timeout = window.setTimeout(() => {
        pendingAcksRef.current.delete(messageId)
        resolve(false)
      }, messageAckTimeoutMs)

      pendingAcksRef.current.set(messageId, {
        timeout,
        resolve,
      })
    })
  ), [])

  const acknowledgeMessage = useCallback(async (message: ChatMessage) => {
    if (!profile || message.toUid !== profile.uid) {
      return
    }

    await publishToUserRoom(message.fromUid, 'chat.message.received', asAppBusPayload({
      messageId: message.id,
      chatId: message.chatId,
      fromUid: message.fromUid,
      toUid: message.toUid,
    }))
  }, [profile, publishToUserRoom])

  const handleMessageAck = useCallback((payload: MessageAckPayload) => {
    if (typeof payload.messageId !== 'string') {
      return
    }

    const pendingAck = pendingAcksRef.current.get(payload.messageId)
    if (!pendingAck) {
      return
    }

    window.clearTimeout(pendingAck.timeout)
    pendingAcksRef.current.delete(payload.messageId)
    pendingAck.resolve(true)
  }, [])

  const notifyUnreadMessage = useCallback(async (message: ChatMessage) => {
    const sender = userLabel(profile ?? undefined)
    await window.sdk.notifications.sendToUser(message.toUid, {
      type: 'info',
      title: `Nuevo mensaje de ${sender}`,
      message: message.body,
      payload: {
        action: 'openApp',
        packageName: 'chat',
        data: {
          uid: message.fromUid,
        },
        chatId: message.chatId,
        messageId: message.id,
        fromUid: message.fromUid,
        toUid: message.toUid,
      },
    })
  }, [profile])

  const sendMessage = useCallback(async () => {
    const body = draft.trim()
    if (!profile || !selectedChat || !selectedPeerUid || body === '') {
      return
    }

    const message: ChatMessage = {
      id: createId(),
      chatId: selectedChat.id,
      fromUid: profile.uid,
      toUid: selectedPeerUid,
      body,
      createdAt: new Date().toISOString(),
    }

    await writeMessage(message)
    await writeChatThread({
      id: selectedChat.id,
      participantUids: selectedChat.participantUids,
      updatedAt: message.createdAt,
      lastMessage: message,
    })

    if (!isOnline(selectedPeerUid)) {
      const nextUnread = await readUnread(selectedPeerUid)
      nextUnread[selectedChat.id] = (nextUnread[selectedChat.id] ?? 0) + 1
      await writeUnread(selectedPeerUid, nextUnread)
    }

    setDraft('')
    mergeMessage(message)
    const ack = waitForMessageAck(message.id)
    await publishToUserRoom(selectedPeerUid, 'chat.message', asAppBusPayload({ message }))
    await publishToUserRoom(profile.uid, 'chat.message', asAppBusPayload({ message }))

    const received = await ack
    if (!received) {
      try {
        if (isOnline(selectedPeerUid)) {
          const nextUnread = await readUnread(selectedPeerUid)
          nextUnread[selectedChat.id] = (nextUnread[selectedChat.id] ?? 0) + 1
          await writeUnread(selectedPeerUid, nextUnread)
        }
        await notifyUnreadMessage(message)
      } catch (reason) {
        console.error(reason)
        setError('El mensaje se envio, pero no se pudo enviar la notificacion.')
      }
    }
  }, [draft, isOnline, mergeMessage, notifyUnreadMessage, profile, publishToUserRoom, selectedChat, selectedPeerUid, waitForMessageAck])

  useEffect(() => {
    const handleThemeChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? webDarkTheme : webLightTheme)
    }

    darkModeQuery.addEventListener('change', handleThemeChange)
    return () => darkModeQuery.removeEventListener('change', handleThemeChange)
  }, [])

  useEffect(() => {
    loadApp()
  }, [loadApp])

  useEffect(() => {
    const unlockNewMessageSound = () => {
      if (newMessageSoundUnlockedRef.current) {
        return
      }

      const audioContext = getNewMessageAudioContext()
      decodeNewMessageSound().catch(() => undefined)

      if (!audioContext) {
        const audio = newMessageAudioRef.current ?? createNewMessageAudio()
        newMessageAudioRef.current = audio
        audio.muted = true
        audio.play()
          .then(() => {
            audio.pause()
            audio.currentTime = 0
            audio.muted = false
            newMessageSoundUnlockedRef.current = true
          })
          .catch(() => {
            audio.muted = false
          })
        return
      }

      audioContext.resume()
        .then(() => {
          newMessageSoundUnlockedRef.current = true
        })
        .catch(() => undefined)
    }

    window.addEventListener('pointerdown', unlockNewMessageSound, { passive: true })
    window.addEventListener('keydown', unlockNewMessageSound)
    return () => {
      window.removeEventListener('pointerdown', unlockNewMessageSound)
      window.removeEventListener('keydown', unlockNewMessageSound)
    }
  }, [createNewMessageAudio, decodeNewMessageSound, getNewMessageAudioContext])

  useEffect(() => {
    if (!profile) {
      return undefined
    }

    const inbox = window.sdk.bus.connect({ scope: 'shared', room: `user:${profile.uid}` }) as ChatBusConnection
    inboxBusRef.current = inbox
    inbox.ready.catch(reason => {
      if (inbox.closed || closingBusConnections.has(inbox)) {
        return
      }
      console.error(reason)
      setError('No se pudo conectar el canal de mensajes en tiempo real.')
    })
    const handleMessage = (event: Event) => {
      const detail = (event as CustomEvent<LocalCloud.AppBusEvent>).detail
      if (detail.type === 'chat.message.received') {
        handleMessageAck(detail.payload as MessageAckPayload)
        return
      }

      if (detail.type !== 'chat.message') {
        return
      }

      const payload = detail.payload as MessagePayload
      if (!payload.message) {
        return
      }

      mergeMessage(payload.message)
      acknowledgeMessage(payload.message).catch(console.error)
      if (payload.message.toUid === profile.uid && payload.message.fromUid !== profile.uid) {
        playNewMessageSound()
        if (payload.message.chatId !== selectedChatIdRef.current) {
          addUnread(payload.message.chatId).catch(console.error)
        }
      }
    }
    inbox.addEventListener('message', handleMessage)

    return () => {
      inbox.removeEventListener('message', handleMessage)
      closeBusConnection(inbox)
      inboxBusRef.current = null
    }
  }, [acknowledgeMessage, addUnread, handleMessageAck, mergeMessage, playNewMessageSound, profile])

  useEffect(() => {
    return () => {
      for (const pendingAck of pendingAcksRef.current.values()) {
        window.clearTimeout(pendingAck.timeout)
        pendingAck.resolve(true)
      }
      pendingAcksRef.current.clear()
    }
  }, [])

  useEffect(() => {
    if (!profile) {
      return undefined
    }

    const presence = window.sdk.bus.connect({ scope: 'shared', room: 'presence' }) as ChatBusConnection
    presenceBusRef.current = presence
    presence.ready.catch(reason => {
      if (presence.closed || closingBusConnections.has(presence)) {
        return
      }
      console.error(reason)
      setError('No se pudo conectar el canal de presencia.')
    })
    const sendPresence = async () => {
      await presence.ready
      presence.send('presence.online', asAppBusPayload({
        uid: profile.uid,
        name: profile.name,
        fullName: profile.fullName,
        at: new Date().toISOString(),
      }))
    }

    const handlePresence = (event: Event) => {
      const detail = (event as CustomEvent<LocalCloud.AppBusEvent>).detail
      if (detail.type !== 'presence.online') {
        return
      }

      const payload = detail.payload as PresencePayload
      if (typeof payload.uid !== 'number') {
        return
      }

      setOnlineUsers(current => ({
        ...current,
        [payload.uid]: Date.now(),
      }))
    }
    presence.addEventListener('message', handlePresence)

    sendPresence().catch(console.error)
    const interval = window.setInterval(() => {
      sendPresence().catch(console.error)
    }, presenceIntervalMs)

    return () => {
      window.clearInterval(interval)
      presence.removeEventListener('message', handlePresence)
      closeBusConnection(presence)
      presenceBusRef.current = null
    }
  }, [profile])

  useEffect(() => {
    if (selectedChatId) {
      clearUnread(selectedChatId).catch(console.error)
    }
  }, [clearUnread, selectedChatId])

  useEffect(() => {
    if (!selectedChatId) {
      return undefined
    }

    let canceled = false
    readMessages(selectedChatId)
      .then(messages => {
        if (canceled) {
          return
        }
        setChats(current => current.map(chat => (
          chat.id === selectedChatId
            ? { ...chat, messages }
            : chat
        )))
      })
      .catch(reason => {
        console.error(reason)
        setError('No se pudieron cargar los mensajes.')
      })

    return () => {
      canceled = true
    }
  }, [selectedChatId])

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ block: 'end' })
  }, [selectedChat?.messages.length, selectedChatId])

  if (loading) {
    return (
      <FluentProvider theme={theme}>
        <div className={styles.center}>
          <Spinner size="huge" label="Cargando chat" />
        </div>
      </FluentProvider>
    )
  }

  return (
    <FluentProvider theme={theme}>
        <main className={styles.shell}>
          {conversationPanelOpen && (
            <div className={styles.mobileOverlay} onClick={() => setConversationPanelOpen(false)} />
          )}

          <aside className={mergeClasses(styles.sidebar, conversationPanelOpen && styles.sidebarOpen)}>
            <div className={styles.sidebarHeader}>
              <div className={styles.titleRow}>
                <div className={styles.brand}>
                  <div className={styles.brandIcon}>
                    <ChatMultipleRegular />
                  </div>
                  <div>
                    <Title1>Chat</Title1>
                    <br />
                    <Caption1>Mensajes internos</Caption1>
                  </div>
                </div>
                <Button
                  appearance="primary"
                  aria-label="Nuevo chat"
                  icon={<AddRegular />}
                  onClick={() => {
                    setNewChatOpen(true)
                    setConversationPanelOpen(false)
                  }}
                />
                <Button
                  appearance="transparent"
                  aria-label="Cerrar conversaciones"
                  className={styles.mobileOnlyButton}
                  icon={<DismissRegular />}
                  onClick={() => setConversationPanelOpen(false)}
                />
              </div>
            </div>

            <div className={styles.chatList}>
              {chats.length === 0 ? (
                <div className={styles.emptyList}>
                  <div>
                    <Subtitle2>No hay conversaciones.</Subtitle2>
                    <br />
                    <Body1>Inicia un chat desde el boton superior.</Body1>
                  </div>
                </div>
              ) : chats.map(chat => {
                const peerUid = chat.participantUids.find(uid => uid !== profile?.uid)
                const peer = peerUid ? usersByUid.get(peerUid) : undefined
                const lastMessage = chat.lastMessage ?? chat.messages.at(-1)
                const unreadCount = unread[chat.id] ?? 0

                return (
                  <div key={chat.id} className={styles.chatItem}>
                    <Button
                      appearance="transparent"
                      className={mergeClasses(styles.chatButton, selectedChatId === chat.id && styles.chatButtonActive)}
                      onClick={() => {
                        setSelectedChatId(chat.id)
                        setConversationPanelOpen(false)
                      }}
                    >
                      <span className={styles.chatButtonInner}>
                        <Avatar
                          name={userLabel(peer)}
                          color="colorful"
                          badge={peerUid && isOnline(peerUid) ? { status: 'available' } : undefined}
                        />
                        <span className={styles.chatButtonContent}>
                          <span className={styles.chatMeta}>
                            <Subtitle2 className={styles.truncate}>{userLabel(peer)}</Subtitle2>
                            {unreadCount > 0 && <Badge appearance="filled" color="brand">{unreadCount}</Badge>}
                          </span>
                          <Caption1 className={styles.truncate}>
                            {lastMessage?.body || 'Conversacion creada'}
                          </Caption1>
                        </span>
                      </span>
                    </Button>
                    <Button
                      appearance="subtle"
                      aria-label="Eliminar conversacion"
                      className={styles.deleteChatButton}
                      icon={<DeleteRegular />}
                      onClick={() => openDeleteChat(chat)}
                    />
                  </div>
                )
              })}
            </div>
          </aside>

          <section className={styles.content}>
            <div className={styles.mobileTopBar}>
              <div className={styles.brand}>
                <div className={styles.brandIcon}>
                  <ChatMultipleRegular />
                </div>
                <Subtitle2>Chat</Subtitle2>
              </div>
              <div className={styles.mobileBarActions}>
                <Button
                  appearance="secondary"
                  icon={<NavigationRegular />}
                  onClick={() => setConversationPanelOpen(true)}
                >
                  Conversaciones
                </Button>
                <Button appearance="primary" icon={<AddRegular />} onClick={() => setNewChatOpen(true)}>
                  Nuevo
                </Button>
              </div>
            </div>

            {selectedChat && selectedPeerUid ? (
              <>
                <header className={styles.header}>
                  <div className={styles.headerUser}>
                    <Avatar name={userLabel(selectedPeer)} color="colorful" />
                    <div className={styles.truncate}>
                      <Subtitle2>{userLabel(selectedPeer)}</Subtitle2>
                      <div className={styles.statusRow}>
                        <span className={mergeClasses(styles.statusDot, isOnline(selectedPeerUid) && styles.statusOnline)} />
                        <Caption1>{isOnline(selectedPeerUid) ? 'Conectado' : 'Desconectado'}</Caption1>
                      </div>
                    </div>
                  </div>
                </header>

                {error && (
                  <MessageBar className={styles.error} intent="error" layout="multiline">
                    <MessageBarBody>
                      <MessageBarTitle>Error</MessageBarTitle>
                      {error}
                    </MessageBarBody>
                  </MessageBar>
                )}

                <div className={styles.messages}>
                  {selectedChat.messages.length === 0 ? (
                    <div className={styles.placeholder}>
                      <div>
                        <PeopleRegular fontSize={34} />
                        <Subtitle2>Aun no hay mensajes.</Subtitle2>
                        <Body1>Escribe para iniciar la conversacion.</Body1>
                      </div>
                    </div>
                  ) : selectedChat.messages.map(message => {
                    const mine = message.fromUid === profile?.uid
                    return (
                      <div
                        key={message.id}
                        className={mergeClasses(styles.messageRow, mine && styles.messageMine)}
                      >
                        <div className={mergeClasses(styles.bubble, mine && styles.bubbleMine)}>
                          <Text>{message.body}</Text>
                          <Caption1>
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Caption1>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messageEndRef} />
                </div>

                <form
                  className={styles.composer}
                  onSubmit={event => {
                    event.preventDefault()
                    sendMessage().catch(reason => {
                      console.error(reason)
                      setError('No se pudo enviar el mensaje.')
                    })
                  }}
                >
                  <Input
                    value={draft}
                    placeholder="Escribe un mensaje"
                    onChange={(_, data) => setDraft(data.value)}
                  />
                  <Button appearance="primary" icon={<SendRegular />} type="submit" disabled={draft.trim() === ''}>
                    Enviar
                  </Button>
                </form>
              </>
            ) : (
              <div className={styles.placeholder}>
                <div>
                  <ChatMultipleRegular fontSize={42} />
                  <br />
                  <Subtitle2>Selecciona o crea una conversacion.</Subtitle2>
                  <br />
                  <Body1>La lista inicia vacia hasta que abras un chat con otro usuario.</Body1>
                  <br />
                  <Button style={{marginTop: tokens.spacingVerticalM}} appearance="primary" icon={<AddRegular />} onClick={() => setNewChatOpen(true)}>
                    Nuevo chat
                  </Button>
                </div>
              </div>
            )}
          </section>

          <Dialog open={newChatOpen} onOpenChange={(_, data) => setNewChatOpen(data.open)}>
            <DialogSurface>
              <DialogBody>
                <DialogTitle
                  action={(
                    <Button
                      appearance="subtle"
                      aria-label="Cerrar"
                      icon={<DismissRegular />}
                      onClick={() => setNewChatOpen(false)}
                    />
                  )}
                >
                  Nueva conversacion
                </DialogTitle>
                <DialogContent>
                  <div className={styles.dialogList}>
                    {users.length === 0 ? (
                      <div className={styles.emptyList}>
                        <Body1>No hay usuarios disponibles.</Body1>
                      </div>
                    ) : users.map(user => (
                      <Button
                        key={user.uid}
                        appearance="transparent"
                        className={styles.userButton}
                        onClick={() => startChat(user).catch(reason => {
                          console.error(reason)
                          setError('No se pudo crear la conversacion.')
                        })}
                      >
                        <span className={styles.chatButtonInner}>
                          <Avatar
                            name={userLabel(user)}
                            color="colorful"
                            badge={isOnline(user.uid) ? { status: 'available' } : undefined}
                          />
                          <span className={styles.chatButtonContent}>
                            <Subtitle2>{userLabel(user)}</Subtitle2>
                            <Caption1>@{user.name} · {isOnline(user.uid) ? 'Conectado' : 'Desconectado'}</Caption1>
                          </span>
                        </span>
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </DialogBody>
            </DialogSurface>
          </Dialog>

          <Dialog open={Boolean(chatToDelete)} onOpenChange={(_, data) => !data.open && closeDeleteChat()}>
            <DialogSurface>
              <DialogBody>
                <DialogTitle>Eliminar conversacion</DialogTitle>
                <DialogContent>
                  <div className={styles.dialogForm}>
                    {deleteChatError && (
                      <MessageBar intent="error" layout="multiline">
                        <MessageBarBody>
                          <MessageBarTitle>Error</MessageBarTitle>
                          {deleteChatError}
                        </MessageBarBody>
                      </MessageBar>
                    )}
                    <Body1>
                      Estas seguro de que quieres eliminar esta conversacion?
                    </Body1>
                    <Caption1>Se borraran los mensajes y esta accion no se puede deshacer.</Caption1>
                  </div>
                </DialogContent>
                <DialogActions>
                  <Button appearance="secondary" disabled={deletingChat} onClick={closeDeleteChat}>
                    Cancelar
                  </Button>
                  <Button
                    appearance="primary"
                    disabled={deletingChat}
                    icon={deletingChat ? undefined : <DeleteRegular />}
                    onClick={() => deleteChat().catch(console.error)}
                  >
                    {deletingChat ? <Spinner size="tiny" label="Eliminando" /> : 'Eliminar'}
                  </Button>
                </DialogActions>
              </DialogBody>
            </DialogSurface>
          </Dialog>
        </main>
    </FluentProvider>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
