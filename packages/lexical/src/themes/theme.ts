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
import { EditorThemeClasses } from 'lexical'

const theme: EditorThemeClasses = {
  text: {
    bold: css`
      font-weight: bold;
    `,
    italic: css`
      font-style: italic;
    `,
    strikethrough: css`
      text-decoration: line-through;
    `,
    underline: css`
      text-decoration: underline;
    `,
    underlineStrikethrough: css`
      text-decoration: line-through underline;
    `,
    code: css`
      background-color: rgb(240, 242, 245);
      padding: 1px 0.25rem;
      font-family: Menlo, Consolas, Monaco, monospace;
      font-size: 94%;
    `,
  },
  paragraph: css`
    margin: 0 0 8px;

    &:last-child {
      margin-bottom: 0;
    }
  `,
  quote: css`
    margin: 5px 0;
    padding-left: 1em;
    border-left: 3px solid #eee;
    color: #8c8c8c;
  `,
  heading: {
    h1: css`
      font-size: 28px;
      font-weight: 800;
      margin: 26px 0 10px 0;
    `,
    h2: css`
      font-size: 24px;
      font-weight: 700;
      margin: 21px 0 5px 0;
    `,
    h3: css`
      font-size: 20px;
      margin: 16px 0 5px 0;
    `,
    h4: css`
      font-size: 16px;
      margin: 10px 0 5px 0;
    `,
    h5: css`
      font-size: 15px;
      margin: 8px 0 5px 0;
    `,
  },
  link: css`
    color: rgb(33, 111, 219);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  `,
  list: {
    listitem: css`
      margin-left: 32px;
    `,
    ol: css`
      margin: 8px 0 5px 0;
      padding: 0;
    `,
    ul: css`
      margin: 8px 0 5px 0;
      padding: 0;
    `,
  },
  table: css`
    border-collapse: collapse;
    border-spacing: 0;
    max-width: 100%;
    overflow-y: scroll;
    table-layout: fixed;
    width: 100%;
  `,
  tableCell: css`
    border: 1px solid black;
    padding: 6px 8px;
    min-width: 75px;
    vertical-align: top;
    text-align: start;
  `,
  tableCellHeader: css`
    background-color: #f2f3f5;
    text-align: start;
  `,
  code: css`
    background-color: rgb(240, 242, 245);
    font-family: Menlo, Consolas, Monaco, monospace;
    display: block;
    padding: 8px 8px 8px 52px;
    line-height: 1.53;
    font-size: 13px;
    margin: 0;
    margin-top: 8px;
    margin-bottom: 8px;
    tab-size: 2;
    overflow-x: auto;
    position: relative;

    &:before {
      content: attr(data-gutter);
      position: absolute;
      background-color: #eee;
      left: 0;
      top: 0;
      border-right: 1px solid #ccc;
      padding: 8px;
      color: #777;
      white-space: pre-wrap;
      text-align: right;
      min-width: 25px;
    }

    &:after {
      content: attr(data-highlight-language);
      top: 0;
      right: 3px;
      padding: 3px;
      font-size: 10px;
      text-transform: uppercase;
      position: absolute;
      color: rgba(0, 0, 0, 0.5);
    }
  `,
  codeHighlight: {
    atrule: css`
      color: #07a;
    `,
    attr: css`
      color: #07a;
    `,
    boolean: css`
      color: #905;
    `,
    builtin: css`
      color: #690;
    `,
    cdata: css`
      color: slategray;
    `,
    char: css`
      color: #690;
    `,
    class: css`
      color: #dd4a68;
    `,
    'class-name': css`
      color: #dd4a68;
    `,
    comment: css`
      color: slategray;
    `,
    constant: css`
      color: #905;
    `,
    deleted: css`
      color: #905;
    `,
    doctype: css`
      color: slategray;
    `,
    entity: css`
      color: #9a6e3a;
    `,
    function: css`
      color: #dd4a68;
    `,
    important: css`
      color: #e90;
    `,
    inserted: css`
      color: #690;
    `,
    keyword: css`
      color: #07a;
    `,
    namespace: css`
      color: #e90;
    `,
    number: css`
      color: #905;
    `,
    operator: css`
      color: #9a6e3a;
    `,
    prolog: css`
      color: slategray;
    `,
    property: css`
      color: #905;
    `,
    punctuation: css`
      color: #dd4a68;
    `,
    regex: css`
      color: #e90;
    `,
    selector: css`
      color: #690;
    `,
    string: css`
      color: #690;
    `,
    symbol: css`
      color: #905;
    `,
    tag: css`
      color: #905;
    `,
    url: css`
      color: #9a6e3a;
    `,
    variable: css`
      color: #e90;
    `,
  },
  image: css`
    cursor: default;
    display: inline-block;
    position: relative;
    max-width: 100%;

    img {
      max-width: 100%;
    }
  `,
}

export default theme
