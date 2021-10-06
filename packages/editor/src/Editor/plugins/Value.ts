// Copyright 2021 LiYechao
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

import { Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import Extension from '../lib/Extension'

export type DocJson = { [key: string]: any }

export interface ValueOptions {
  defaultValue?: DocJson
  editable?: boolean
  onDispatchTransaction?: (view: EditorView, tr: Transaction) => void
}

export default class Value extends Extension {
  constructor(public readonly options: ValueOptions = {}) {
    super()
  }

  get name() {
    return 'value'
  }

  defaultValue = () => this.options.defaultValue

  editable = () => this.options.editable ?? false

  dispatchTransaction = (view: EditorView, tr: Transaction) => {
    this.options.onDispatchTransaction?.(view, tr)
  }
}
