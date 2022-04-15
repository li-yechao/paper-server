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

export const PROSEMIRROR_DOCUMENT = JSON.stringify({
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: {
        level: 1,
      },
      content: [
        {
          type: 'text',
          text: 'H1',
        },
      ],
    },
    {
      type: 'heading',
      attrs: {
        level: 2,
      },
      content: [
        {
          type: 'text',
          text: 'H2',
        },
      ],
    },
    {
      type: 'heading',
      attrs: {
        level: 3,
      },
      content: [
        {
          type: 'text',
          text: 'H3',
        },
      ],
    },
    {
      type: 'heading',
      attrs: {
        level: 4,
      },
      content: [
        {
          type: 'text',
          text: 'H4',
        },
      ],
    },
    {
      type: 'heading',
      attrs: {
        level: 5,
      },
      content: [
        {
          type: 'text',
          text: 'H5',
        },
      ],
    },
    {
      type: 'heading',
      attrs: {
        level: 6,
      },
      content: [
        {
          type: 'text',
          text: 'H6',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'paragraph ',
        },
        {
          type: 'text',
          marks: [
            {
              type: 'bold',
            },
          ],
          text: 'bold',
        },
        {
          type: 'text',
          text: ' ',
        },
        {
          type: 'text',
          marks: [
            {
              type: 'italic',
            },
          ],
          text: 'italic',
        },
        {
          type: 'text',
          text: ' ',
        },
        {
          type: 'text',
          marks: [
            {
              type: 'strikethrough',
            },
          ],
          text: 'delete',
        },
        {
          type: 'text',
          text: ' ',
        },
        {
          type: 'text',
          marks: [
            {
              type: 'underline',
            },
          ],
          text: 'underline',
        },
        {
          type: 'text',
          text: ' ',
        },
        {
          type: 'text',
          marks: [
            {
              type: 'highlight',
            },
          ],
          text: 'mark',
        },
        {
          type: 'text',
          text: ' ',
        },
        {
          type: 'text',
          marks: [
            {
              type: 'code',
            },
          ],
          text: 'code',
        },
        {
          type: 'text',
          text: ' ',
        },
        {
          type: 'text',
          marks: [
            {
              type: 'link',
              attrs: {
                href: 'https://paper.yechao.xyz',
              },
            },
          ],
          text: 'link',
        },
        {
          type: 'text',
          text: ' ',
        },
      ],
    },
    {
      type: 'blockquote',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'quote',
            },
          ],
        },
      ],
    },
    {
      type: 'ordered_list',
      content: [
        {
          type: 'list_item',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'list item 1',
                },
              ],
            },
          ],
        },
        {
          type: 'list_item',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'list item 2',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'bullet_list',
      content: [
        {
          type: 'list_item',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'bullet item 1',
                },
              ],
            },
          ],
        },
        {
          type: 'list_item',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'bullet item 2',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'code_block',
      attrs: {
        editorId: '5PCZqa9crmi76lyx70Fif',
        language: 'js',
      },
      content: [
        {
          type: 'text',
          text: 'function main() {\n    console.log("HELLO WORLD")\n}',
        },
      ],
    },
    {
      type: 'image_block',
      attrs: {
        src: '625aaf71028c8e043943ed75',
        naturalWidth: 220,
        naturalHeight: 294,
        thumbnail:
          'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYAAAAAAQwAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAHRyWFlaAAABZAAAABRnWFlaAAABeAAAABRiWFlaAAABjAAAABRyVFJDAAABoAAAAChnVFJDAAABoAAAAChiVFJDAAABoAAAACh3dHB0AAAByAAAABRjcHJ0AAAB3AAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAFgAAAAcAHMAUgBHAEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhZWiAAAAAAAABvogAAOPUAAAOQWFlaIAAAAAAAAGKZAAC3hQAAGNpYWVogAAAAAAAAJKAAAA+EAAC2z3BhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABYWVogAAAAAAAA9tYAAQAAAADTLW1sdWMAAAAAAAAAAQAAAAxlblVTAAAAIAAAABwARwBvAG8AZwBsAGUAIABJAG4AYwAuACAAMgAwADEANv/bAEMAEAsMDgwKEA4NDhIREBMYKBoYFhYYMSMlHSg6Mz08OTM4N0BIXE5ARFdFNzhQbVFXX2JnaGc+TXF5cGR4XGVnY//bAEMBERISGBUYLxoaL2NCOEJjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY//AABEIABIADQMBIgACEQEDEQH/xAAXAAADAQAAAAAAAAAAAAAAAAAAAgUE/8QAJRAAAQMDAwMFAAAAAAAAAAAAAgABAwURIQQSEwYWYSIjMkJR/8QAFgEBAQEAAAAAAAAAAAAAAAAAAQAC/8QAFxEBAQEBAAAAAAAAAAAAAAAAAAECEf/aAAwDAQACEQMRAD8At6iqRRAd8kDs21Ze5NEGDAr+FNrRx6EQkINoE+wSH64SNTW4ozKGE2IbsRtl090pJR1RmmDfPuMnMi4YfU/x/fDIQlh//9k=',
      },
      content: [
        {
          type: 'text',
          text: 'image.png',
        },
      ],
    },
    {
      type: 'table',
      content: [
        {
          type: 'tr',
          content: [
            {
              type: 'th',
              attrs: {
                rowspan: 1,
                colspan: 1,
              },
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '123',
                    },
                  ],
                },
              ],
            },
            {
              type: 'th',
              attrs: {
                rowspan: 1,
                colspan: 1,
              },
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '123',
                    },
                  ],
                },
              ],
            },
            {
              type: 'th',
              attrs: {
                rowspan: 1,
                colspan: 1,
              },
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '123',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'tr',
          content: [
            {
              type: 'td',
              attrs: {
                rowspan: 1,
                colspan: 1,
              },
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '333',
                    },
                  ],
                },
              ],
            },
            {
              type: 'td',
              attrs: {
                rowspan: 1,
                colspan: 1,
              },
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '222',
                    },
                  ],
                },
              ],
            },
            {
              type: 'td',
              attrs: {
                rowspan: 1,
                colspan: 1,
              },
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '1111',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'paragraph',
    },
  ],
})
