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

import styled from '@emotion/styled'
import { InputRule } from 'prosemirror-inputrules'
import { MarkSpec, MarkType } from 'prosemirror-model'
import { useState } from 'react'
import Launch from '../icons/Launch'
import LinkIcon from '../icons/Link'
import { createMarkMenu, MenuComponentType } from '../lib/FloatingToolbar'
import getMarkRange from '../lib/getMarkRange'
import isMarkActive from '../lib/isMarkActive'
import { Mark } from '../lib/Mark'
import toggleMark from '../lib/toggleMark'

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

  menus({ type }: { type: MarkType }): MenuComponentType[] {
    return [
      {
        ...createMarkMenu({
          icon: <LinkIcon />,
          isActive: isMarkActive(type),
          toggleMark: toggleMark(type),
        }),
        expand: ({ view }) => {
          const { selection } = view.state
          const range = getMarkRange(selection.$from, type)
          const [href, setHref] = useState(range?.mark.attrs['href'] || '')

          const submit = () => {
            view.dispatch(
              href.trim()
                ? view.state.tr.addMark(selection.from, selection.to, type.create({ href }))
                : view.state.tr.removeMark(selection.from, selection.to, type)
            )
          }

          const openLink = () => {
            if (href.trim()) {
              window.open(href, '__blank')
            }
          }

          return (
            <_LinkExpand>
              <input
                value={href}
                onChange={e => setHref(e.target.value)}
                onKeyUp={e => e.key === 'Enter' && submit()}
                onBlur={submit}
              />
              <_Button onClick={openLink}>
                <Launch />
              </_Button>
            </_LinkExpand>
          )
        },
        isExtraPanelVisible: view => isMarkActive(type)(view.state),
      },
    ]
  }
}

const _Button = styled.button`
  appearance: none;
  border: none;
  outline: none;
  background-color: transparent;
  cursor: pointer;
  padding: 4px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`

const _LinkExpand = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 8px;

  input {
    flex: 1;
    margin-right: 4px;
    padding: 4px 8px;
  }
`
