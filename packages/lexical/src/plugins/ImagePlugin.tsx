import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getSelection,
  $isRangeSelection,
  $isRootNode,
  createCommand,
  RangeSelection,
} from 'lexical'
import { useEffect } from 'react'
import { $createImageNode, ImageNode, useImageNodeContext } from '../nodes/ImageNode'

export interface InsertImageCommandPayload {
  src?: string
  naturalWidth?: number
  naturalHeight?: number
  thumbnail?: string
  width?: number
  height?: number
}

export const INSERT_IMAGE_COMMAND = createCommand<InsertImageCommandPayload>()

export default function ImagePlugin() {
  const [editor] = useLexicalComposerContext()
  const { upload } = useImageNodeContext()

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error('ImagePlugin: ImageNode not registered on editor')
    }

    const unregister = editor.registerCommand<InsertImageCommandPayload>(
      INSERT_IMAGE_COMMAND,
      payload => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          const s = selection as RangeSelection
          if ($isRootNode(s.anchor.getNode())) {
            s.insertParagraph()
          }
          const img = $createImageNode(payload)
          s.insertNodes([img])
        }
        return true
      },
      0
    )

    const pasteHandler = async (e: Event) => {
      for (const file of (e as ClipboardEvent).clipboardData?.files ?? []) {
        const url = await upload(file)
        if (url) {
          const size = await getImageSize(url)
          editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src: url, ...size, thumbnail: url })
        }
      }
    }

    window.addEventListener('paste', pasteHandler, true)

    return () => {
      unregister()
      window.removeEventListener('paste', pasteHandler, true)
    }
  }, [editor])

  return null
}

async function getImageSize(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.src = url
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
    }
    image.onerror = error => {
      reject(new Error(error.toString()))
    }
  })
}
