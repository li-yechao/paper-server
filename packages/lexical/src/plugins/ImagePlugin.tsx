// Copyright 2022 LiYechao
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getSelection, $isRangeSelection, $isRootNode, createCommand } from 'lexical'
import { useEffect } from 'react'
import { $createImageNode, ImageNode, ImageNodeOptions } from '../nodes/ImageNode'

export const INSERT_IMAGE_COMMAND = createCommand<ImageNodeOptions>()

export default function ImagePlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error('ImagePlugin: ImageNode not registered on editor')
    }

    const unregister = editor.registerCommand<ImageNodeOptions>(
      INSERT_IMAGE_COMMAND,
      payload => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          if ($isRootNode(selection.anchor.getNode())) {
            selection.insertParagraph()
          }
          const img = $createImageNode(payload)
          selection.insertNodes([img])
        }
        return true
      },
      0
    )

    const pasteHandler = async (e: Event) => {
      const files = ((e as ClipboardEvent).clipboardData || (e as DragEvent).dataTransfer)?.files
      for (const file of files ?? []) {
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, { file })
      }
    }

    window.addEventListener('paste', pasteHandler, true)
    window.addEventListener('drop', pasteHandler, true)

    return () => {
      unregister()
      window.removeEventListener('paste', pasteHandler, true)
      window.removeEventListener('drop', pasteHandler, true)
    }
  }, [editor])

  return null
}
