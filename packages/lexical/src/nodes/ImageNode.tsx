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
import { DecoratorNode, EditorConfig, LexicalNode, NodeKey } from 'lexical'
import { createContext, ReactNode, useContext, useMemo } from 'react'
import { useAsync } from 'react-use'

export interface ImageNodeOptions {
  src?: string
  naturalWidth?: number
  naturalHeight?: number
  width?: number
  height?: number
  thumbnail?: string
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

export class ImageNode extends DecoratorNode<ReactNode> {
  static Provider = imageNodeContext.Provider

  __src?: string
  __naturalWidth?: number
  __naturalHeight?: number
  __thumbnail?: string
  __width?: number
  __height?: number

  static getType() {
    return 'image'
  }

  static clone(node: ImageNode) {
    return new ImageNode({
      src: node.__src,
      naturalWidth: node.__naturalWidth,
      naturalHeight: node.__naturalHeight,
      thumbnail: node.__thumbnail,
      width: node.__width,
      height: node.__height,
      key: node.__key,
    })
  }

  constructor(
    options: ImageNodeOptions & {
      key?: NodeKey
    }
  ) {
    super(options.key)
    this.__src = options.src
    this.__naturalWidth = options.naturalWidth
    this.__naturalHeight = options.naturalHeight
    this.__thumbnail = options.thumbnail
    this.__width = options.width
    this.__height = options.height
  }

  setWidthAndHeight(width: number | undefined, height: number | undefined) {
    const writable = this.getWritable<ImageNode>()
    writable.__width = width
    writable.__height = height
  }

  setThumbnail(thumbnail: string | undefined) {
    const writable = this.getWritable<ImageNode>()
    writable.__thumbnail = thumbnail
  }

  override createDOM<EditorContext>(config: EditorConfig<EditorContext>): HTMLElement {
    const span = document.createElement('span')
    const theme = config.theme
    const className = theme.image
    if (className !== undefined) {
      span.className = className
    }
    return span
  }

  override updateDOM(): false {
    return false
  }

  override decorate(): ReactNode {
    return (
      <ImageComponent
        src={this.__src}
        thumbnail={this.__thumbnail}
        naturalWidth={this.__naturalWidth}
        naturalHeight={this.__naturalHeight}
        width={this.__width}
        height={this.__height}
      />
    )
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
  src,
  thumbnail,
  naturalWidth,
  naturalHeight,
  width,
  height,
}: ImageNodeOptions) {
  const [w, ratio] = useMemo(() => {
    if (width && height) {
      return [width, (height / width) * 100]
    } else if (naturalWidth && naturalHeight) {
      return [naturalWidth, (naturalHeight / naturalWidth) * 100]
    }
    return [0, 0]
  }, [naturalWidth, naturalHeight, width, height])

  const { source } = useImageNodeContext()
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

export function $isImageNode(node?: LexicalNode): node is ImageNode {
  return node instanceof ImageNode
}

const _ImageContainer = styled.div`
  display: inline-block;

  > img {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
`
