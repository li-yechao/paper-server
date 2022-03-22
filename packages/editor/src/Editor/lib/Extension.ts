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

import { Plugin, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

export interface Extension {
  readonly name: string

  dispatchTransaction?(view: EditorView, tr: Transaction): void

  defaultValue?(): { [key: string]: any } | undefined

  plugins?(): Plugin[]
}
