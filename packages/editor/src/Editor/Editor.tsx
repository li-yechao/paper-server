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
import { forwardRef, memo, useEffect, useImperativeHandle, useRef } from 'react'
import { useUpdate } from 'react-use'
import CupertinoActivityIndicator from './lib/CupertinoActivityIndicator'
import State from './lib/State'
import useAsync from './lib/useAsync'
import { proseMirrorStyle } from './style'

export interface EditorProps {
  className?: string
  autoFocus?: boolean
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
    const previousView = useRef<EditorView>()

    const state = useAsync(async () => {
      if (!container.current) {
        throw new Error('Container element is not found in dom')
      }

      if (previousView.current) {
        previousView.current.destroy()
      }

      const { view } = await props.state.createEditor(
        { mount: container.current },
        { dispatchTransaction: () => update() }
      )

      previousView.current = view

      return { view }
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
      <div className={cx(props.className, rootCSS)}>
        <div
          data-testid="prosemirror-editor"
          ref={container}
          className={cx('ProseMirrorEditor', proseMirrorStyle)}
        />

        {state.loading ? (
          <div className={loadingCSS}>
            <CupertinoActivityIndicator />
          </div>
        ) : null}
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
