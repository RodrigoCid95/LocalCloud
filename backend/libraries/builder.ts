import type { InitLibrary } from 'phoenix-js/core'
import type { BuilderClass } from 'interfaces/Builder'

export const builder: InitLibrary = () => {
  const Builder: BuilderClass = require(`./../builder/${'index.js'}`).Builder
  return new Builder()
}