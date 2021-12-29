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
import React, { forwardRef, useState } from 'react'
import { useEffect } from 'react'
import { useImperativeHandle } from 'react'
import { useRef } from 'react'
import { useSafeUpdate } from '../utils/useSafeUpdate'
import CupertinoActivityIndicator from './lib/CupertinoActivityIndicator'
import State from './lib/State'
import FloatingToolbar from './lib/FloatingToolbar'
import BlockMenu from './plugins/BlockMenu'
import { proseMirrorStyle } from './style'
import useAsync from '../utils/useAsync'

export interface EditorProps {
  className?: string
  autoFocus?: boolean
  state: State
}

export interface EditorElement {
  focus(): void
  readonly view?: EditorView
}

const Editor = React.memo(
  forwardRef<EditorElement, EditorProps>((props, ref) => {
    const update = useSafeUpdate()

    const container = useRef<HTMLDivElement>(null)
    const previousView = useRef<EditorView>()

    const [blockMenuKeyword, setBlockMenuKeyword] = useState<string | null>(null)

    const state = useAsync(async () => {
      if (previousView.current) {
        previousView.current.destroy()
      }

      const { view, menus } = await props.state.createEditor(
        { mount: container.current! },
        { dispatchTransaction: () => update() }
      )

      previousView.current = view

      const blockMenu = props.state.extensions.find<BlockMenu>(
        (i): i is BlockMenu => i instanceof BlockMenu
      )
      blockMenu?.setOptions({
        onOpen: setBlockMenuKeyword,
        onClose: () => setBlockMenuKeyword(null),
      })

      return { view, menus, blockMenu }
    }, [props.state])

    const view = state.value?.view

    useImperativeHandle(
      ref,
      () => ({
        focus: () => view?.focus(),
        get view() {
          return view
        },
      }),
      []
    )

    useEffect(() => {
      if (view && props.autoFocus) {
        const { tr, doc } = view.state
        view.dispatch(tr.setSelection(TextSelection.atEnd(doc)))
        view.focus()
      }
    }, [props.autoFocus, view])

    if (state.error) {
      throw state.error
    }

    return (
      <div className={rootCSS}>
        <div ref={container} className={cx(props.className, proseMirrorStyle)} />
        {state.loading ? (
          <div className={loadingCSS}>
            <CupertinoActivityIndicator />
          </div>
        ) : (
          <>
            <FloatingToolbar view={state.value.view} menus={state.value.menus} />
            {state.value.blockMenu && (
              <state.value.blockMenu.Menus
                keyword={blockMenuKeyword}
                view={state.value.view}
                onClose={() => setBlockMenuKeyword(null)}
              />
            )}
          </>
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
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

export default Editor
