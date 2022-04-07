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

import { InputRule } from 'prosemirror-inputrules'
import { MarkSpec, MarkType } from 'prosemirror-model'
import { Mark } from '../lib/Mark'

export default class Link implements Mark {
  get name() {
    return 'link'
  }

  get schema(): MarkSpec {
    return {
      attrs: { href: { default: '' } },
      inclusive: false,
      parseDOM: [
        {
          tag: 'a[href]',
          getAttrs: dom => ({
            href: (dom as HTMLElement).getAttribute('href'),
          }),
        },
      ],
      toDOM: node => [
        'a',
        { ...node.attrs, rel: 'noopener noreferrer nofollow', target: '__blank' },
        0,
      ],
    }
  }

  inputRules({ type }: { type: MarkType }): InputRule[] {
    return [
      new InputRule(/\[(.+)]\((https?:\/\/\S+)\)/, (state, match, start, end) => {
        const [okay, alt, href] = match
        const { tr } = state

        if (okay) {
          tr.replaceWith(start, end, type.schema.text(alt!)).addMark(
            start,
            start + alt!.length,
            type.create({ href })
          )
        }

        return tr
      }),
      new InputRule(/<(https?:\/\/\S+)>/, (state, match, start, end) => {
        const [okay, href] = match
        const { tr } = state

        if (okay) {
          tr.replaceWith(start, end, type.schema.text(href!)).addMark(
            start,
            start + href!.length,
            type.create({ href })
          )
        }

        return tr
      }),
    ]
  }
}
