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

import Ajv, { JTDSchemaType } from 'ajv/dist/jtd'
import * as IPFSFiles from 'ipfs-core-types/src/files'
import { customAlphabet } from 'nanoid'

export interface Object {
  readonly id: string

  readonly createdAt: number

  readonly files: ObjectFiles

  read(path: string, options?: IPFSFiles.ReadOptions): Promise<ArrayBuffer>

  write(
    path: string,
    content: string | ArrayBuffer,
    options?: IPFSFiles.WriteOptions
  ): Promise<void>

  get info(): Promise<ObjectInfo>

  get updatedAt(): Promise<number>

  setInfo(info?: Partial<ObjectInfo>): Promise<ObjectInfo>
}

export interface ObjectFiles {
  cp(from: string | string[], to: string, options?: IPFSFiles.CpOptions): Promise<void>

  mkdir(path: string, options?: IPFSFiles.MkdirOptions): Promise<void>

  stat(
    ipfsPath: string,
    options?: IPFSFiles.StatOptions
  ): Promise<Omit<IPFSFiles.StatResult, 'cid'> & { cid: string }>

  touch(ipfsPath: string, options?: IPFSFiles.TouchOptions): Promise<void>

  rm(ipfsPaths: string | string[], options?: IPFSFiles.RmOptions): Promise<void>

  read(ipfsPath: string, options?: IPFSFiles.ReadOptions): AsyncIterable<Uint8Array>

  write(
    ipfsPath: string,
    content: string | Uint8Array | Blob | AsyncIterable<Uint8Array> | Iterable<Uint8Array>,
    options?: IPFSFiles.WriteOptions
  ): Promise<void>

  mv(from: string | string[], to: string, options?: IPFSFiles.MvOptions): Promise<void>

  ls(ipfsPath: string): AsyncIterable<IPFSFiles.MFSEntry>
}

export interface ObjectInfo {
  title?: string
  description?: string
}

export const objectInfoSchema: JTDSchemaType<ObjectInfo> = {
  properties: {},
  optionalProperties: {
    title: { type: 'string' },
    description: { type: 'string' },
  },
  additionalProperties: true,
} as const

export const validateObjectInfo = new Ajv().compile(objectInfoSchema)

export namespace ObjectId {
  const objectNonce = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 5)
  export const objectIdReg = /^(?<createdAt>\d+)-(?<nonce>[0-9|A-Z]{5})$/

  export function create(date?: Date, nonce?: string): ObjectId {
    date ??= new Date()
    nonce ??= objectNonce()
    return { createdAt: date.getTime(), nonce }
  }

  export function parse(id: string | ObjectId): ObjectId {
    if (typeof id !== 'string') {
      return id
    }
    const m = id.match(objectIdReg)
    if (m?.groups) {
      const createdAt = parseInt(m.groups.createdAt)
      const nonce = m.groups.nonce
      return { createdAt, nonce }
    }
    throw new Error(`Invalid object id ${id}`)
  }

  export function toString(id: string | ObjectId): string {
    const oid = typeof id === 'string' ? parse(id) : id
    return `${oid.createdAt}-${oid.nonce}`
  }
}

export interface ObjectId {
  createdAt: number
  nonce: string
}
