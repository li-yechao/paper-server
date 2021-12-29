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

import { css, cx } from '@emotion/css'
import { TextSelection } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import React, { forwardRef, useMemo, useState } from 'react'
import { useEffect } from 'react'
import { useImperativeHandle } from 'react'
import { useRef } from 'react'
import { useSafeUpdate } from '../utils/useSafeUpdate'
import CupertinoActivityIndicator from './lib/CupertinoActivityIndicator'
import Extension from './lib/Extension'
import ExtensionManager from './lib/ExtensionManager'
import FloatingToolbar, { MenuComponentType } from './lib/FloatingToolbar'
import BlockMenu from './plugins/BlockMenu'
import { proseMirrorStyle } from './style'

export interface EditorProps {
  className?: string
  autoFocus?: boolean
  extensions: Extension[]
}

export interface EditorElement {
  focus(): void
  readonly view?: EditorView
}

const Editor = React.memo(
  forwardRef<EditorElement, EditorProps>((props, ref) => {
    const update = useSafeUpdate()

    const container = useRef<HTMLDivElement>(null)
    const editor = useRef<{ view: EditorView; menus: MenuComponentType[] }>()

    const [blockMenuKeyword, setBlockMenuKeyword] = useState<string | null>(null)

    useImperativeHandle(
      ref,
      () => ({
        focus: () => editor.current?.view.focus(),
        get view() {
          return editor.current?.view
        },
      }),
      []
    )

    useEffect(() => {
      ;(async () => {
        if (editor.current) {
          editor.current.view.destroy()
          editor.current = undefined
        }

        if (!container.current) {
          return
        }

        editor.current = await new ExtensionManager(props.extensions).createEditor(
          { mount: container.current },
          {
            dispatchTransaction: () => update(),
          }
        )
        update()
      })()
    }, [props.extensions])

    useEffect(() => {
      const view = editor.current?.view
      if (view && props.autoFocus) {
        const { tr, doc } = view.state
        view.dispatch(tr.setSelection(TextSelection.atEnd(doc)))
        view.focus()
      }
    }, [])

    const blockMenu = useMemo(() => {
      const e = props.extensions.find<BlockMenu>((i): i is BlockMenu => i instanceof BlockMenu)
      e?.setOptions({
        onOpen: setBlockMenuKeyword,
        onClose: () => setBlockMenuKeyword(null),
      })
      return e
    }, [props.extensions])

    return (
      <div className={rootCSS}>
        <div ref={container} className={cx(props.className, proseMirrorStyle)} />
        {editor.current ? (
          <>
            <FloatingToolbar view={editor.current.view} menus={editor.current.menus} />
            {blockMenu && (
              <blockMenu.Menus
                keyword={blockMenuKeyword}
                view={editor.current.view}
                onClose={() => setBlockMenuKeyword(null)}
              />
            )}
          </>
        ) : (
          <div className={loadingCSS}>
            <CupertinoActivityIndicator />
          </div>
        )}
      </div>
    )
  })
)

const rootCSS = css`
  position: relative;
  margin-left: 24px;
  margin-right: 24px;
`

const loadingCSS = css`
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

export default Editor
