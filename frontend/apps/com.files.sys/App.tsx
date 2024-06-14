import { lazy, useState, Suspense, useEffect } from "react"
import { Spinner, Toolbar, ToolbarButton } from "@fluentui/react-components"
import { FolderPeopleFilled, FolderPersonFilled } from '@fluentui/react-icons'
import DirectionBar from "./components/DirectionBar"

import './App.css'
import BinRecycleMenu from "./components/BinRecycleMenu"
import SharedMenu from "./components/SharedMenu"

const Explorer = lazy(() => import('./components/Explorer'))

class TransfersClass implements Transfers {
  #list: Transfer[] = []
  #listeners: any[] = []
  get list() {
    return this.#list
  }
  #dispatch() {
    for (const listener of this.#listeners) {
      listener()
    }
  }
  add(upload: Transfer) {
    this.#list.push(upload)
    this.#dispatch()
  }
  remove(index: number) {
    this.#list.splice(index, 1)
    this.#dispatch()
  }
  on(callback: any) {
    this.#listeners.push(callback)
  }
  off(callback: any) {
    this.#listeners = this.#listeners.filter(listener => listener !== callback)
  }
}

window.uploads = new TransfersClass()
window.downloads = new TransfersClass()

window.explorerClipboard = new class implements ExplorerClipboard {
  #clipboardCopy: string[] | string[][] | undefined = undefined
  #clipboardCut: string[] | string[][] | undefined = undefined
  #listeners: any[] = []
  get pendingPaste() {
    return ((this.#clipboardCopy !== undefined) || (this.#clipboardCut !== undefined))
  }
  #dispatch() {
    for (const listener of this.#listeners) {
      listener()
    }
  }
  toCopy(src: string[] | string[][]): void {
    this.#clipboardCopy = src
    this.#clipboardCut = undefined
    this.#dispatch()
  }
  toCut(src: string[] | string[][]): void {
    this.#clipboardCut = src
    this.#clipboardCopy = undefined
    this.#dispatch()
  }
  on(callback: any): void {
    this.#listeners.push(callback)
  }
  off(callback: any): void {
    this.#listeners = this.#listeners.filter(listener => listener !== callback)
  }
  async paste(dest: string[]): Promise<void> {
    if (this.pendingPaste) {
      const src: string[] | string[][] = this.#clipboardCopy || this.#clipboardCut || []
      const isCopy = this.#clipboardCopy !== undefined
      const method = isCopy ? window.connectors.fs.copy : window.connectors.fs.move
      if (typeof src[0] === 'string') {
        await method(src as string[], dest)
      } else {
        for (const source of src) {
          await method(source as string[], dest)
        }
      }
      this.#clipboardCopy = undefined
      this.#clipboardCut = undefined
      this.#dispatch()
    }
  }
}()

window.createEmitter = () => {
  return new class implements Emitter {
    #listeners: any[] = []
    on(callback: any): void {
      this.#listeners.push(callback)
    }
    off(callback: any): void {
      this.#listeners = this.#listeners.filter(listener => listener !== callback)
    }
    emit(): void {
      for (const listener of this.#listeners) {
        listener()
      }
    }
  }()
}

const App = () => {
  const mediaQuery = window.matchMedia('(max-width: 560px)')
  const [verticalToolbar, setVerticalToolbar] = useState<boolean>(mediaQuery.matches)
  const [path, setPath] = useState<string[]>([])

  useEffect(() => {
    mediaQuery.addEventListener('change', e => setVerticalToolbar(e.matches))
  }, [setVerticalToolbar])

  if (path.length === 0) {
    return (
      <div className="initial">
        <Toolbar vertical={verticalToolbar} size='large'>
          <ToolbarButton
            icon={<FolderPeopleFilled />}
            vertical
            onClick={() => setPath(['shared'])}
          >
            Carpeta compartida
          </ToolbarButton>
          <ToolbarButton
            icon={<FolderPersonFilled />}
            vertical
            onClick={() => setPath(['user'])}
          >
            Carpeta Personal
          </ToolbarButton>
          <BinRecycleMenu />
          <SharedMenu />
        </Toolbar>
      </div>
    )
  } else {
    return (
      <>
        <DirectionBar
          path={path}
          onGo={newPath => setPath(newPath)}
        />
        <Suspense fallback={<Spinner style={{ marginTop: '16px' }} />}>
          <Explorer
            path={path}
            onGo={newPath => setPath(newPath)}
          />
        </Suspense>
      </>
    )
  }
}

export default App