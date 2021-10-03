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

import { useEffect, useState } from 'react'
import { RouteComponentProps } from 'react-router'
import { useRecoilValue } from 'recoil'
import { accountSelector } from '../../../state/account'
import { Paper } from '../paper'
import useOnSave from '../../../utils/useOnSave'

export interface ObjectViewProps
  extends Pick<
    RouteComponentProps<{
      name: string
      objectId: string
    }>,
    'match'
  > {}

export default function ObjectView(props: ObjectViewProps) {
  const { name: userId, objectId } = props.match.params
  const account = useRecoilValue(accountSelector)
  const [paper, setPaper] = useState<Paper>()
  const [content, setContent] = useState('')

  useEffect(() => {
    ;(async () => {
      const object = await account?.draft(objectId)
      if (object) {
        const paper = new Paper(object)
        setPaper(paper)
        const content = await paper.getContent()
        setContent(content)
      }
    })()
  }, [userId, objectId])

  useOnSave(async () => {
    await paper?.setContent(content)
  }, [paper, content])

  return (
    <div>
      <textarea value={content} onChange={e => setContent(e.target.value)} />
    </div>
  )
}
