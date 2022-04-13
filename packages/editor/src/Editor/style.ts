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

import { css } from '@emotion/css'

export const proseMirrorStyle = css`
  font-family: 'Chinese Quote', 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif, 'Apple Color Emoji';
  word-wrap: break-word;
  outline-style: none;
  white-space: pre-wrap;
  font-size: 15px;
  line-height: 1.74;
  letter-spacing: 0.008em;
  outline: none;
  position: relative;
  word-wrap: break-word;
  white-space: pre-wrap;
  white-space: break-spaces;
  -webkit-font-variant-ligatures: none;
  font-variant-ligatures: none;
  font-feature-settings: 'liga' 0; /* the above doesn't seem to work in Edge */
  padding: 0.5em;

  pre {
    white-space: pre-wrap;
  }

  li {
    position: relative;
  }

  &.ProseMirror-hideselection *::selection {
    background: transparent;
  }
  &.ProseMirror-hideselection *::-moz-selection {
    background: transparent;
  }
  &.ProseMirror-hideselection {
    caret-color: transparent;
  }

  &.ProseMirror-selectednode {
    outline: 2px solid #8cf;
  }

  /* Make sure li selections wrap around markers */
  li.ProseMirror-selectednode {
    outline: none;
  }

  li.ProseMirror-selectednode:after {
    content: '';
    position: absolute;
    left: -32px;
    right: -2px;
    top: -2px;
    bottom: -2px;
    border: 2px solid #8cf;
    pointer-events: none;
  }

  ul,
  ol {
    margin: 8px 0 5px 0;
    padding: 0;

    li {
      margin-left: 32px;

      &:before {
        background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iOCIgeT0iNyIgd2lkdGg9IjMiIGhlaWdodD0iMiIgcng9IjEiIGZpbGw9IiM0RTVDNkUiLz4KPHJlY3QgeD0iOCIgeT0iMTEiIHdpZHRoPSIzIiBoZWlnaHQ9IjIiIHJ4PSIxIiBmaWxsPSIjNEU1QzZFIi8+CjxyZWN0IHg9IjgiIHk9IjE1IiB3aWR0aD0iMyIgaGVpZ2h0PSIyIiByeD0iMSIgZmlsbD0iIzRFNUM2RSIvPgo8cmVjdCB4PSIxMyIgeT0iNyIgd2lkdGg9IjMiIGhlaWdodD0iMiIgcng9IjEiIGZpbGw9IiM0RTVDNkUiLz4KPHJlY3QgeD0iMTMiIHk9IjExIiB3aWR0aD0iMyIgaGVpZ2h0PSIyIiByeD0iMSIgZmlsbD0iIzRFNUM2RSIvPgo8cmVjdCB4PSIxMyIgeT0iMTUiIHdpZHRoPSIzIiBoZWlnaHQ9IjIiIHJ4PSIxIiBmaWxsPSIjNEU1QzZFIi8+Cjwvc3ZnPgo=');
        content: '';
        display: inline-block;
        cursor: move;
        width: 24px;
        height: 24px;
        position: absolute;
        left: -56px;
        vertical-align: text-bottom;
        opacity: 0;
        transition: opacity 200ms ease-in-out;
      }

      &:hover {
        &:before {
          opacity: 1;
        }
      }
    }
  }

  ul[data-type='tag_list'] {
    display: flex;
    flex-wrap: wrap;
    list-style: none;
    margin-top: 16px;
    margin-bottom: 16px;
    line-height: 1.4;

    li {
      margin: 4px 8px 4px 0;
      border: 1px solid currentColor;
      border-radius: 100px;
      padding-left: 8px;
      padding-right: 8px;

      &:before {
        display: none;
      }
    }
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 0;
    margin-bottom: 0;
    word-spacing: 1px;
    font-weight: bold;
    padding: 0;
    position: relative;

    &:before {
      position: absolute;
      font-size: 14px;
      line-height: 0;
      margin-left: -24px;
      width: 24px;
      font-weight: normal;
      opacity: 0;
      display: inline-block;
      transition: all 200ms ease-in-out;
    }

    &:hover {
      &:before {
        opacity: 0.8;
      }
    }
  }

  h1 {
    font-size: 28px;
    line-height: 36px;
    margin: 26px 0 10px 0;

    &:before {
      content: 'H1';
      top: 26px;
      margin-top: -2px;
    }
  }

  h2 {
    font-size: 24px;
    line-height: 32px;
    margin: 21px 0 5px 0;

    &:before {
      content: 'H2';
      top: 21px;
      margin-top: -2px;
    }
  }

  h3 {
    font-size: 20px;
    line-height: 28px;
    margin: 16px 0 5px 0;

    &:before {
      content: 'H3';
      top: 16px;
    }
  }

  h4 {
    font-size: 16px;
    line-height: 24px;
    margin: 10px 0 5px 0;

    &:before {
      content: 'H4';
      top: 10px;
      margin-top: 3px;
    }
  }

  h5 {
    font-size: 15px;
    line-height: 24px;
    margin: 8px 0 5px 0;

    &:before {
      content: 'H5';
      top: 8px;
      margin-top: 4px;
    }
  }

  h6 {
    font-size: 15px;
    line-height: 24px;
    font-weight: normal;
    margin: 8px 0 5px 0;

    &:before {
      content: 'H6';
      top: 8px;
      margin-top: 4px;
    }
  }

  p {
    margin: 0;
    min-height: 24px;
  }

  blockquote {
    margin: 5px 0;
    padding-left: 1em;
    border-left: 3px solid #eee;
    color: #8c8c8c;
  }

  > blockquote {
    > h1,
    > h2,
    > h3,
    > h4,
    > h5,
    > h6 {
      &:before {
        margin-left: -42px;
      }
    }

    > ul,
    > ol {
      > li {
        &:before {
          left: -74px;
        }
      }
    }
  }

  code {
    font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, Courier, monospace;
    font-size: inherit;
    background-color: rgba(0, 0, 0, 0.06);
    padding: 0 2px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 2px 2px;
    line-height: inherit;
    word-wrap: break-word;
    text-indent: 0;
  }

  a {
    word-wrap: break-word;
    text-decoration: none;
    color: #096dd9;

    &:active {
      text-decoration: none;
      color: #096dd9;
    }

    &:hover {
      text-decoration: none;
      color: #1890ff;
    }
  }

  .ProseMirror-placeholder {
    &:before {
      position: absolute;
      color: #999;
      pointer-events: none;
      content: attr(data-placeholder);
    }
  }

  h1.title {
    margin-top: 8px;
    margin-bottom: 8px;
  }

  .ProseMirror-gapcursor {
    display: none;
    pointer-events: none;
    position: absolute;

    &:after {
      content: '';
      display: block;
      position: absolute;
      top: -2px;
      width: 20px;
      border-top: 1px solid currentColor;
      animation: ProseMirror-cursor-blink 1.1s steps(2, start) infinite;
    }

    @keyframes ProseMirror-cursor-blink {
      to {
        visibility: hidden;
      }
    }
  }

  &.ProseMirror-focused .ProseMirror-gapcursor {
    display: block;
  }

  .scrollable-wrapper {
    position: relative;
    margin: 0.5em 0px;
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;

    &:hover {
      scrollbar-color: rgba(0, 0, 0, 0.3) rgba(0, 0, 0, 0.1);
    }

    & ::-webkit-scrollbar {
      height: 14px;
      background-color: transparent;
    }

    &:hover ::-webkit-scrollbar {
      background-color: rgba(0, 0, 0, 0.1);
    }

    & ::-webkit-scrollbar-thumb {
      background-color: transparent;
      border: 3px solid transparent;
      border-radius: 7px;
    }

    &:hover ::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.3);
      border-color: rgba(0, 0, 0, 0.1);
    }
  }

  .scrollable {
    overflow-y: hidden;
    overflow-x: auto;
    padding-left: 18px;
    margin-left: -18px;
    border-left: 1px solid transparent;
    border-right: 1px solid transparent;
    transition: border 250ms ease-in-out 0s;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    border-radius: 4px;
    margin-top: 18px;
    box-sizing: border-box;

    * {
      box-sizing: border-box;
    }

    tr {
      position: relative;
      border-bottom: 1px solid currentColor;
    }

    td,
    th {
      position: relative;
      vertical-align: top;
      border: 1px solid currentColor;
      position: relative;
      padding: 4px 8px;
      min-width: 100px;
    }

    .selectedCell {
      background: rgba(0, 0, 0, 0.1);

      /* fixes Firefox background color painting over border:
       * https://bugzilla.mozilla.org/show_bug.cgi?id=688556 */
      background-clip: padding-box;
    }

    .grip-column {
      color: inherit;

      /* usage of ::after for all of the table grips works around a bug in
      * prosemirror-tables that causes Safari to hang when selecting a cell
      * in an empty table:
      * https://github.com/ProseMirror/prosemirror/issues/947 */
      &::after {
        content: '';
        cursor: pointer;
        position: absolute;
        top: -18px;
        left: 0;
        width: 100%;
        height: 12px;
        background: currentColor;
        border-bottom: 3px solid currentColor;
        display: block;
        opacity: 0.2;
      }

      &.first::after {
        border-top-left-radius: 3px;
      }
      &.last::after {
        border-top-right-radius: 3px;
      }
      &:hover::after {
        opacity: 0.8;
      }
      &.selected::after {
        opacity: 0.8;
      }
    }

    .grip-row {
      color: inherit;

      &::after {
        content: '';
        cursor: pointer;
        position: absolute;
        left: -18px;
        top: 0;
        height: 100%;
        width: 12px;
        background: currentColor;
        border-right: 3px solid currentColor;
        opacity: 0.2;
      }

      &.first::after {
        border-top-left-radius: 3px;
      }
      &.last::after {
        border-bottom-left-radius: 3px;
      }
      &:hover::after {
        opacity: 0.8;
      }
      &.selected::after {
        opacity: 0.8;
      }
    }

    .grip-table {
      color: inherit;

      &::after {
        content: '';
        cursor: pointer;
        background: currentColor;
        width: 13px;
        height: 13px;
        border-radius: 13px;
        border: 2px solid currentColor;
        position: absolute;
        top: -18px;
        left: -18px;
        display: block;
        opacity: 0.2;
      }

      &:hover::after {
        opacity: 0.8;
      }
      &.selected::after {
        opacity: 0.8;
      }
    }
  }
`
