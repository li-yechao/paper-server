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

import { css, cx } from '@emotion/css'
import { TextSelection } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useUpdate } from 'react-use'
import { BlockMenu } from '.'
import CupertinoActivityIndicator from './lib/CupertinoActivityIndicator'
import FloatingToolbar from './lib/FloatingToolbar'
import State from './lib/State'
import useAsync from './lib/useAsync'
import { proseMirrorStyle } from './style'

export interface EditorProps {
  className?: string
  autoFocus?: boolean
  readOnly?: boolean
  state: State
}

export interface EditorElement {
  focus(): void
  readonly view?: EditorView
}

const Editor = memo(
  forwardRef<EditorElement, EditorProps>((props, ref) => {
    const update = useUpdate()

    const container = useRef<HTMLDivElement>(null)

    const [blockMenuKeyword, setBlockMenuKeyword] = useState<string | null>(null)

    const state = useAsync(async () => {
      const { view, menus } = await props.state.createEditor(undefined, {
        dispatchTransaction: () => update(),
        editable: () => !props.readOnly,
      })

      const blockMenu = props.state.options.extensions?.find<BlockMenu>(
        (i): i is BlockMenu => i instanceof BlockMenu
      )
      blockMenu?.setOptions({
        onOpen: setBlockMenuKeyword,
        onClose: () => setBlockMenuKeyword(null),
      })

      return { view, menus, blockMenu }
    }, [props.state])

    useEffect(() => {
      state.value?.view.setProps({ editable: () => !props.readOnly })
    }, [props.readOnly])

    const view = state.value?.view

    useEffect(() => {
      if (!container.current) {
        return
      }
      const dom = view?.dom

      if (dom) {
        dom.setAttribute('data-testid', 'prosemirror-editor')
        dom.className = cx('ProseMirrorEditor', proseMirrorStyle)
        container.current.prepend(dom)
        return () => {
          view.destroy()
          dom.remove()
        }
      }
      return
    }, [view?.dom])

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
      <div ref={container} className={cx(props.className, rootCSS)}>
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
  display: flex;
  flex-direction: column;

  > .ProseMirrorEditor {
    flex: 1;
  }
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
