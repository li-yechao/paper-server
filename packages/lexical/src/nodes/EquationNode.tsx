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

import { DecoratorNode, LexicalNode, NodeKey } from 'lexical'
import katex from 'katex'
import 'katex/dist/katex.css'
import { ReactNode, useEffect, useRef } from 'react'

type EquationComponentProps = {
  equation: string
  inline: boolean
  nodeKey: NodeKey
}

function EquationComponent({ equation, inline }: EquationComponentProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const element = ref.current

    if (element) {
      katex.render(equation, element, {
        displayMode: !inline,
        errorColor: '#cc0000',
        output: 'html',
        strict: 'warn',
        throwOnError: false,
        trust: false,
      })
    }
  }, [equation, inline])

  return <span ref={ref} />
}

export class EquationNode extends DecoratorNode<ReactNode> {
  __equation: string
  __inline: boolean

  static getType(): string {
    return 'equation'
  }

  static clone(node: EquationNode): EquationNode {
    return new EquationNode(node.__equation, node.__inline, node.__key)
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
    const writable = this.getWritable<EquationNode>()
    writable.__equation = equation
  }

  override decorate() {
    return (
      <EquationComponent equation={this.__equation} inline={this.__inline} nodeKey={this.__key} />
    )
  }
}

export function $createEquationNode(equation = '', inline = false): EquationNode {
  return new EquationNode(equation, inline)
}

export function $isEquationNode(node?: LexicalNode): node is EquationNode {
  return node instanceof EquationNode
}
