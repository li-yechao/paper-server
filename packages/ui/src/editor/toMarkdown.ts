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

import { defaultMarkdownSerializer, DocJson, MarkdownSerializer, Node, Schema } from '@paper/editor'
import { defaultMarks, defaultNodes } from './schema'

export default function toMarkdown(json: DocJson): string {
  const nodes = defaultNodes({
    imageBlockOptions: {
      upload: async () => {
        throw new Error('Unimplements')
      },
      getSrc: async () => {
        throw new Error('Unimplements')
      },
      thumbnail: {
        maxSize: 1024,
      },
    },
  })
  const marks = defaultMarks()

  const schema = new Schema({
    nodes: nodes
      .concat(nodes.flatMap(i => i.childNodes ?? []))
      .reduce((res, i) => ({ ...res, [i.name]: i.schema }), {}),
    marks: marks.reduce((res, i) => ({ ...res, [i.name]: i.schema }), {}),
  })

  const doc = Node.fromJSON(schema, json)

  return new MarkdownSerializer(
    defaultMarkdownSerializer.nodes,
    defaultMarkdownSerializer.marks
  ).serialize(doc)
}
