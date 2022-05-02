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
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical'
import { useEffect } from 'react'
import { $createEquationNode, EquationNode } from '../nodes/EquationNode'

export interface InsertEquationCommandPayload {
  equation: string
  inline: boolean
}

export const INSERT_EQUATION_COMMAND = createCommand<InsertEquationCommandPayload>()

export default function EquationsPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([EquationNode])) {
      throw new Error('EquationPlugin: EquationNode not registered on editor')
    }

    return editor.registerCommand<InsertEquationCommandPayload>(
      INSERT_EQUATION_COMMAND,
      payload => {
        const { equation, inline } = payload
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          const equationNode = $createEquationNode(equation, inline)
          selection.insertNodes([equationNode])
        }
        return true
      },
      COMMAND_PRIORITY_EDITOR
    )
  }, [editor])

  return null
}
