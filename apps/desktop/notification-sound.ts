import newNotificationSoundUrl from './new-notification.wav'

let audioContext: AudioContext | null = null
let audioBuffer: AudioBuffer | null = null
let audioBufferPromise: Promise<AudioBuffer | null> | null = null
let fallbackAudio: HTMLAudioElement | null = null
let unlocked = false

const createFallbackAudio = () => {
  const audio = new Audio(newNotificationSoundUrl)
  audio.preload = 'auto'
  audio.volume = 1
  return audio
}

const getAudioContext = () => {
  if (audioContext) {
    return audioContext
  }

  const AudioContextConstructor = window.AudioContext ?? (
    window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }
  ).webkitAudioContext

  if (!AudioContextConstructor) {
    return null
  }

  audioContext = new AudioContextConstructor()
  return audioContext
}

const decodeNotificationSound = () => {
  if (audioBuffer) {
    return Promise.resolve(audioBuffer)
  }

  if (audioBufferPromise) {
    return audioBufferPromise
  }

  const context = getAudioContext()
  if (!context) {
    return Promise.resolve(null)
  }

  const [, base64Sound = ''] = newNotificationSoundUrl.split(',')
  const binarySound = atob(base64Sound)
  const soundBytes = new Uint8Array(binarySound.length)
  for (let index = 0; index < binarySound.length; index++) {
    soundBytes[index] = binarySound.charCodeAt(index)
  }

  const soundBuffer = soundBytes.buffer.slice(
    soundBytes.byteOffset,
    soundBytes.byteOffset + soundBytes.byteLength,
  ) as ArrayBuffer

  audioBufferPromise = context.decodeAudioData(soundBuffer)
    .then(decodedAudioBuffer => {
      audioBuffer = decodedAudioBuffer
      return decodedAudioBuffer
    })
    .catch(reason => {
      console.warn('No se pudo preparar el sonido de notificacion.', reason)
      return null
    })

  return audioBufferPromise
}

const playNotificationSoundFallback = () => {
  if (!fallbackAudio) {
    fallbackAudio = createFallbackAudio()
  }

  const audio = fallbackAudio.paused
    ? fallbackAudio
    : createFallbackAudio()

  audio.currentTime = 0
  audio.play().catch(reason => {
    console.warn('No se pudo reproducir el sonido de notificacion.', reason)
  })
}

export const playNewNotificationSound = () => {
  const context = getAudioContext()
  if (!context) {
    playNotificationSoundFallback()
    return
  }

  context.resume()
    .then(() => decodeNotificationSound())
    .then(decodedAudioBuffer => {
      if (!decodedAudioBuffer) {
        playNotificationSoundFallback()
        return
      }

      const source = context.createBufferSource()
      const gain = context.createGain()
      gain.gain.value = 1
      source.buffer = decodedAudioBuffer
      source.connect(gain)
      gain.connect(context.destination)
      source.start()
    })
    .catch(reason => {
      console.warn('No se pudo reproducir el sonido de notificacion.', reason)
      playNotificationSoundFallback()
    })
}

export const setupNewNotificationSound = () => {
  const unlockSound = () => {
    if (unlocked) {
      return
    }

    const context = getAudioContext()
    decodeNotificationSound().catch(() => undefined)

    if (!context) {
      const audio = fallbackAudio ?? createFallbackAudio()
      fallbackAudio = audio
      audio.muted = true
      audio.play()
        .then(() => {
          audio.pause()
          audio.currentTime = 0
          audio.muted = false
          unlocked = true
        })
        .catch(() => {
          audio.muted = false
        })
      return
    }

    context.resume()
      .then(() => {
        unlocked = true
        decodeNotificationSound().catch(() => undefined)
      })
      .catch(() => undefined)
  }

  window.addEventListener('pointerdown', unlockSound, { passive: true })
  window.addEventListener('keydown', unlockSound)
}
