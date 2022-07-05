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

import {
  $getNodeByKey,
  DecoratorNode,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical'
import katex from 'katex'
import 'katex/dist/katex.css'
import { ReactNode, useEffect, useRef, useState } from 'react'
import styled from '@emotion/styled'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { cx } from '@emotion/css'

export type SerializedEquationNode = Spread<
  {
    type: 'equation'
    version: 1
    equation: string
    inline: boolean
  },
  SerializedLexicalNode
>

export class EquationNode extends DecoratorNode<ReactNode> {
  __equation: string
  __inline: boolean

  static override getType(): string {
    return 'equation'
  }

  static override clone(node: EquationNode): EquationNode {
    return new EquationNode(node.__equation, node.__inline, node.__key)
  }

  static override importJSON(serializedNode: SerializedEquationNode): EquationNode {
    return $createEquationNode(serializedNode.equation, serializedNode.inline)
  }

  constructor(equation: string, inline?: boolean, key?: NodeKey) {
    super(key)
    this.__equation = equation
    this.__inline = inline ?? false
  }

  override createDOM(): HTMLElement {
    return document.createElement(this.__inline ? 'span' : 'div')
  }

  override updateDOM(prevNode: EquationNode): boolean {
    // If the inline property changes, replace the element
    return this.__inline !== prevNode.__inline
  }

  setEquation(equation: string): void {
    const writable = this.getWritable()
    writable.__equation = equation
  }

  getEquation(): string {
    return this.__equation
  }

  getInline(): boolean {
    return this.__inline
  }

  override decorate() {
    return (
      <EquationComponent equation={this.__equation} inline={this.__inline} nodeKey={this.__key} />
    )
  }

  override exportJSON(): SerializedEquationNode {
    return {
      type: 'equation',
      version: 1,
      equation: this.__equation,
      inline: this.__inline,
    }
  }
}

export function $createEquationNode(equation = '', inline = false): EquationNode {
  return new EquationNode(equation, inline)
}

export function $isEquationNode(node?: LexicalNode): node is EquationNode {
  return node instanceof EquationNode
}

type EquationComponentProps = {
  equation: string
  inline: boolean
  nodeKey: NodeKey
}

function EquationComponent({ equation, inline, nodeKey }: EquationComponentProps) {
  const [editor] = useLexicalComposerContext()
  const [showEditor, toggleShowEditor] = useState(false)

  return showEditor ? (
    <EquationEditor
      equation={equation}
      inline={inline}
      onOk={value => {
        toggleShowEditor(false)
        editor.update(() => {
          const node = $getNodeByKey(nodeKey)
          if (node && $isEquationNode(node)) {
            node.setEquation(value)
          }
        })
      }}
    />
  ) : (
    <EquationRenderer equation={equation} inline={inline} onClick={() => toggleShowEditor(true)} />
  )
}

function EquationRenderer({
  equation,
  inline,
  onClick,
}: {
  equation: string
  inline: boolean
  onClick?: () => void
}) {
  const span = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const element = span.current

    if (element) {
      katex.render(equation.trim() || '$', element, {
        displayMode: !inline,
        errorColor: '#cc0000',
        output: 'html',
        strict: 'warn',
        throwOnError: false,
        trust: false,
      })
    }
  }, [equation, inline])

  return <_EquationRenderer ref={span} className={cx(inline && 'inline')} onClick={onClick} />
}

const _EquationRenderer = styled.span`
  display: block;
  text-align: center;

  &.inline {
    display: inline;
  }
`

function EquationEditor({
  inline,
  ...props
}: {
  equation: string
  inline: boolean
  onOk?: (value: string) => void
}) {
  return inline ? <EquationInlineEditor {...props} /> : <EquationBlockEditor {...props} />
}

function EquationInlineEditor({
  equation,
  onOk,
}: {
  equation: string
  onOk?: (value: string) => void
}) {
  const [value, setValue] = useState(equation || '')

  const handleBlur = () => {
    onOk?.(value)
  }

  return (
    <InlineEditorContainer>
      <span>{'$'}</span>
      <input
        autoFocus
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === 'Escape' && handleBlur()}
        onBlur={handleBlur}
      />
      <span>{'$'}</span>
    </InlineEditorContainer>
  )
}

function EquationBlockEditor({
  equation,
  onOk,
}: {
  equation: string
  onOk?: (value: string) => void
}) {
  const [value, setValue] = useState(equation || '')

  const handleBlur = () => {
    onOk?.(value)
  }

  return (
    <BlockEditorContainer>
      <span>{'$$\n'}</span>
      <textarea
        autoFocus
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === 'Escape' && handleBlur()}
        onBlur={handleBlur}
      />
      <span>{'\n$$'}</span>
    </BlockEditorContainer>
  )
}

const InlineEditorContainer = styled.span`
  background-color: #eee;

  > input {
    padding: 0;
    margin: 0;
    border: 0;
    outline: 0;
    color: #8421a2;
    background-color: inherit;
    resize: none;
    line-height: 16px;
  }

  > span {
    color: #b0b0b0;
  }
`

const BlockEditorContainer = styled.div`
  background-color: #eee;

  > textarea {
    padding: 0;
    margin: 0;
    border: 0;
    outline: 0;
    color: #8421a2;
    background-color: inherit;
    resize: none;
    width: 100%;
  }

  > span {
    color: #b0b0b0;
  }
`
