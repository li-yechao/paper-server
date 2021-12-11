import { setBlockType } from 'prosemirror-commands'
import { NodeType } from 'prosemirror-model'
import { EditorState, Transaction } from 'prosemirror-state'
import isNodeActive from './isNodeActive'

export default function toggleBlockType(
  type: NodeType,
  toggleType: NodeType,
  attrs: Record<string, any> = {}
) {
  return (state: EditorState, dispatch: (tr: Transaction) => void) => {
    const isActive = isNodeActive(type, attrs)(state)

    if (isActive) {
      return setBlockType(toggleType)(state, dispatch)
    }

    return setBlockType(type, attrs)(state, dispatch)
  }
}
