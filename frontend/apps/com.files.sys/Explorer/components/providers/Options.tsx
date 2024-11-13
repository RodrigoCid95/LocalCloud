import { type FC, type ReactNode, useCallback, useRef, useState } from "react"
import { type PositioningImperativeRef, Link, Menu, MenuDivider, MenuItem, MenuList, MenuPopover, Toast, Toaster, ToastTitle, ToastTrigger, useId, useToastController } from "@fluentui/react-components"
import { type Reference, OptionsContext } from "../../context/options"
import { useExplorer } from "../../context/explorer"
import { useClipboard } from "../../context/clipboard"
import { ArrowDownloadFilled, ArrowDownloadRegular, bundleIcon, ClipboardPasteFilled, ClipboardPasteRegular, CopyFilled, CopyRegular, CutFilled, CutRegular, DeleteFilled, DeleteRegular, OpenFilled, OpenRegular, RenameFilled, RenameRegular, ShareFilled, ShareRegular } from '@fluentui/react-icons'
import { useDownloads } from "../../context/downloads"
import { useRename } from "../../context/rename"

const OpenIcon = bundleIcon(OpenFilled, OpenRegular)
const CopyIcon = bundleIcon(CopyFilled, CopyRegular)
const CutIcon = bundleIcon(CutFilled, CutRegular)
const PasteIcon = bundleIcon(ClipboardPasteFilled, ClipboardPasteRegular)
const DownloadIcon = bundleIcon(ArrowDownloadFilled, ArrowDownloadRegular)
const ShareIcon = bundleIcon(ShareFilled, ShareRegular)
const RenameIcon = bundleIcon(RenameFilled, RenameRegular)
const DeleteIcon = bundleIcon(DeleteFilled, DeleteRegular)

const OptionsProvider: FC<OptionsContextProps> = ({ children }) => {
  const { baseDir, path, go, refresh } = useExplorer()
  const { addToRename } = useRename()
  const { copy, cut, pendingPaste, paste } = useClipboard()
  const { addDownload } = useDownloads()
  const positioningRef = useRef<PositioningImperativeRef>(null)
  const [reference, setReference] = useState<Reference | undefined>(undefined)
  const toasterId = useId("toaster")
  const { dispatchToast } = useToastController(toasterId)

  const addReference = useCallback((reference: Reference) => {
    positioningRef.current?.setTarget(reference.target)
    setReference(reference)
  }, [positioningRef])

  const handleOnOpen = () => {
    if (reference) {
      const { fileInfo } = reference
      if (fileInfo.isFile) {
        window.launchFile(baseDir, ...path, fileInfo.name)
      } else {
        go([...path, fileInfo.name])
      }
      setReference(undefined)
    }
  }

  const handleOnCopy = () => {
    if (reference) {
      const { fileInfo } = reference
      copy([baseDir, ...path, fileInfo.name])
      setReference(undefined)
    }
  }

  const handleOnCut = () => {
    if (reference) {
      const { fileInfo } = reference
      cut([baseDir, ...path, fileInfo.name])
      setReference(undefined)
    }
  }

  const handleOnPaste = () => {
    if (reference) {
      const { fileInfo } = reference
      paste([baseDir, ...path, fileInfo.name])
      setReference(undefined)
    }
  }

  const hadnleOnDownload = () => {
    if (reference) {
      const { fileInfo } = reference
      addDownload([...path, fileInfo.name])
      setReference(undefined)
    }
  }

  const handleOnShare = () => {
    if (reference) {
      const { fileInfo } = reference
      window.connectors.shared.create([baseDir, ...path, fileInfo.name]).then(({ id }) => {
        const url = window.createURL({ path: ['shared', id] }).href
        if (document.hasFocus()) {
          navigator.clipboard.writeText(url)
        }
        dispatchToast(
          <Toast>
            <ToastTitle
              action={
                <ToastTrigger>
                  <Link>Aceptar</Link>
                </ToastTrigger>
              }
            >Archivo compartido y en el portapapeles.</ToastTitle>
          </Toast>,
          { intent: "success" }
        )
      })
      setReference(undefined)
    }
  }

  const handleOnRename = () => {
    if (reference) {
      const { fileInfo } = reference
      addToRename([baseDir, ...path, fileInfo.name])
      setReference(undefined)
    }
  }

  const handleOnDelete = () => {
    if (reference) {
      const { fileInfo } = reference
      window.connectors.recycleBin
        .add([baseDir, ...path, fileInfo.name])
        .then(refresh)
      setReference(undefined)
    }
  }

  return (
    <OptionsContext.Provider value={{ reference, addReference }}>
      {children}
      <Menu
        open={reference !== undefined}
        onOpenChange={(_, data) => {
          if (!data.open) {
            setReference(undefined)
          }
        }}
        positioning={{ positioningRef }}
      >
        <MenuPopover>
          <MenuList>
            <MenuItem icon={<OpenIcon />} onClick={handleOnOpen}>Abrir</MenuItem>
            <MenuItem icon={<CopyIcon />} onClick={handleOnCopy}>Copiar</MenuItem>
            <MenuItem icon={<CutIcon />} onClick={handleOnCut}>Cortar</MenuItem>
            {pendingPaste && !reference?.fileInfo.isFile && (
              <>
                <MenuDivider />
                <MenuItem icon={<PasteIcon />} onClick={handleOnPaste}>Pegar</MenuItem>
              </>
            )}
            <MenuDivider />
            {reference?.fileInfo.isFile && (
              <>
                <MenuItem icon={<DownloadIcon />} onClick={hadnleOnDownload}>Descargar</MenuItem>
                <MenuItem icon={<ShareIcon />} onClick={handleOnShare}>Compartir</MenuItem>
              </>
            )}
            <MenuItem icon={<RenameIcon />} onClick={handleOnRename}>Renombrar</MenuItem>
            <MenuItem icon={<DeleteIcon />} onClick={handleOnDelete}>Mover a la papelera</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
      <Toaster
        toasterId={toasterId}
        position="bottom-end"
        pauseOnHover
        pauseOnWindowBlur
      />
    </OptionsContext.Provider>
  )
}

export default OptionsProvider

interface OptionsContextProps {
  children: ReactNode
}