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
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getNodeByKey,
  DecoratorNode,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical'
import { createContext, ReactNode, useContext, useEffect, useMemo } from 'react'
import { useAsync } from 'react-use'
import { getImageThumbnail, readAsDataURL } from '../utils/image'

export interface ImageNodeOptions {
  file?: File
  src?: string
  naturalWidth?: number
  naturalHeight?: number
  width?: number
  height?: number
  thumbnail?: string
  caption?: string
}

const imageNodeContext = createContext<
  | {
      source: (
        src?: string | null | undefined
      ) => Promise<string | null | undefined> | string | null | undefined
      upload: (file: File) => Promise<string | null | undefined> | string | null | undefined
    }
  | undefined
>(undefined)

export type SerializedImageNode = Spread<
  {
    type: 'image'
    version: 1
    src?: string
    naturalWidth?: number
    naturalHeight?: number
    thumbnail?: string
    width?: number
    height?: number
    caption?: string
  },
  SerializedLexicalNode
>

export class ImageNode extends DecoratorNode<ReactNode> {
  static Provider = imageNodeContext.Provider

  file?: File
  __src?: string
  __naturalWidth?: number
  __naturalHeight?: number
  __thumbnail?: string
  __width?: number
  __height?: number
  __caption?: string

  static override getType() {
    return 'image'
  }

  static override clone(node: ImageNode) {
    return new ImageNode({
      file: node.file,
      src: node.__src,
      naturalWidth: node.__naturalWidth,
      naturalHeight: node.__naturalHeight,
      thumbnail: node.__thumbnail,
      width: node.__width,
      height: node.__height,
      caption: node.__caption,
      key: node.__key,
    })
  }

  static override importJSON(serializedNode: SerializedImageNode): ImageNode {
    return $createImageNode(serializedNode)
  }

  constructor(options: ImageNodeOptions & { key?: NodeKey }) {
    super(options.key)
    this.file = options.file
    this.__src = options.src
    this.__naturalWidth = options.naturalWidth
    this.__naturalHeight = options.naturalHeight
    this.__thumbnail = options.thumbnail
    this.__width = options.width
    this.__height = options.height
    this.__caption = options.caption
  }

  setOptions(
    options: Pick<ImageNodeOptions, 'naturalWidth' | 'naturalHeight' | 'thumbnail' | 'src'>
  ) {
    const writable = this.getWritable()
    if (options.naturalWidth !== undefined) {
      writable.__naturalWidth = options.naturalWidth
    }
    if (options.naturalHeight !== undefined) {
      writable.__naturalHeight = options.naturalHeight
    }
    if (options.thumbnail !== undefined) {
      writable.__thumbnail = options.thumbnail
    }
    if (options.src !== undefined) {
      writable.__src = options.src
    }
  }

  setWidthAndHeight(width: number | undefined, height: number | undefined) {
    const writable = this.getWritable()
    writable.__width = width
    writable.__height = height
  }

  setThumbnail(thumbnail: string | undefined) {
    const writable = this.getWritable()
    writable.__thumbnail = thumbnail
  }

  setCaption(caption: string | undefined) {
    const writable = this.getWritable()
    writable.__caption = caption
  }

  override createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span')
    if (config.theme.image) {
      span.classList.add(config.theme.image)
    }
    return span
  }

  override updateDOM(): false {
    return false
  }

  override decorate(): ReactNode {
    return (
      <ImageComponent
        file={this.file}
        src={this.__src}
        thumbnail={this.__thumbnail}
        naturalWidth={this.__naturalWidth}
        naturalHeight={this.__naturalHeight}
        width={this.__width}
        height={this.__height}
        nodeKey={this.__key}
      />
    )
  }

  override exportJSON(): SerializedImageNode {
    return {
      type: 'image',
      version: 1,
      src: this.__src,
      thumbnail: this.__thumbnail,
      naturalWidth: this.__naturalWidth,
      naturalHeight: this.__naturalHeight,
      width: this.__width,
      height: this.__height,
      caption: this.__caption,
    }
  }
}

export function useImageNodeContext() {
  const context = useContext(imageNodeContext)
  if (!context) {
    throw new Error(`ImageNode must be used in a ImageNode.Provider component`)
  }
  return context
}

function ImageComponent({
  file,
  src,
  thumbnail,
  naturalWidth,
  naturalHeight,
  width,
  height,
  nodeKey,
}: ImageNodeOptions & { nodeKey: NodeKey }) {
  const [editor] = useLexicalComposerContext()
  const { upload, source } = useImageNodeContext()

  useEffect(() => {
    if (file && !thumbnail) {
      getImageThumbnail(file)
        .then(({ thumbnail, naturalWidth, naturalHeight }) =>
          readAsDataURL(thumbnail).then(thumbnail => ({ thumbnail, naturalWidth, naturalHeight }))
        )
        .then(({ thumbnail, naturalWidth, naturalHeight }) => {
          editor.update(() => {
            const node = $getNodeByKey(nodeKey)
            if ($isImageNode(node)) {
              node.setOptions({
                thumbnail,
                naturalWidth,
                naturalHeight,
              })
            }
          })
        })
    }
  }, [editor, file, thumbnail])

  useEffect(() => {
    if (file && !src) {
      Promise.resolve(upload(file)).then(src => {
        if (!src) {
          return
        }
        editor.update(() => {
          const node = $getNodeByKey(nodeKey)
          if ($isImageNode(node)) {
            node.setOptions({ src })
          }
        })
      })
    }
  }, [editor, file, src])

  const [w, ratio] = useMemo(() => {
    if (width && height) {
      return [width, (height / width) * 100]
    } else if (naturalWidth && naturalHeight) {
      return [naturalWidth, (naturalHeight / naturalWidth) * 100]
    }
    return [0, 0]
  }, [naturalWidth, naturalHeight, width, height])

  const { value } = useAsync(async () => source(src), [src])

  return (
    <_ImageContainer style={{ width: w }}>
      <div style={{ paddingBottom: `${ratio}%` }} />
      {thumbnail && <img src={thumbnail} />}
      {value && <img src={value} />}
    </_ImageContainer>
  )
}

export function $createImageNode(options: ImageNodeOptions): ImageNode {
  return new ImageNode(options)
}

export function $isImageNode(node?: LexicalNode | null): node is ImageNode {
  return node instanceof ImageNode
}

const _ImageContainer = styled.div`
  display: inline-block;
  max-width: 100%;

  > img {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
`
