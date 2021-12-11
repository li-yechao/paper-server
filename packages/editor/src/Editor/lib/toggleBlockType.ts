import { setBlockType } from 'prosemirror-commands'
import { NodeType } from 'prosemirror-model'
import { EditorState, Selection, Transaction } from 'prosemirror-state'
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

const CAN_TOGGLE_BLOCK_TYPES = ['paragraph', 'heading', 'blockquote']

export function canToggleBlockType(selection: Selection): boolean {
  if (selection.empty) {
    return false
  }

  const { content } = selection.content()
  for (let i = 0; i < content.childCount; i++) {
    if (!CAN_TOGGLE_BLOCK_TYPES.includes(content.child(i).type.name)) {
      return false
    }
  }
  return true
}
