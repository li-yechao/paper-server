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

'use strict'

const { spawnSync } = require('child_process')
const fs = require('fs')
const got = require('got')
const hasha = require('hasha')
const { HttpProxyAgent } = require('http-proxy-agent')
const HttpsProxyAgent = require('https-proxy-agent')
const os = require('os')
const path = require('path')
const tar = require('tar-fs')
const zlib = require('zlib')

/**
 * Get got agent
 * @returns {got.Agents}
 */
function getAgent() {
  const allProxy = process.env['all_proxy'] || process.env['ALL_PROXY']
  const httpProxy = process.env['http_proxy'] || process.env['HTTP_RPOXY'] || allProxy
  const httpsProxy = process.env['https_proxy'] || process.env['HTTPS_RPOXY'] || allProxy
  return {
    // @ts-ignore
    http: httpProxy ? new HttpProxyAgent(httpProxy) : undefined,
    // @ts-ignore
    https: httpsProxy ? HttpsProxyAgent(httpsProxy) : undefined,
  }
}

/**
 * Download ipfs
 * @param {string} dir download path
 * @param {string} version ipfs version
 * @returns {Promise<string>}
 */
async function download(dir, version) {
  const binPath = path.join(dir, 'go-ipfs', 'ipfs')

  if (fs.existsSync(binPath)) {
    return binPath
  }

  const platform = os.platform()

  let arch = os.arch()
  if (arch === 'x64') {
    arch = 'amd64'
  }

  const url = `https://github.com/ipfs/go-ipfs/releases/download/${version}/go-ipfs_${version}_${platform}-${arch}.tar.gz`
  const cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), `go-ipfs-${version}-`))
  const filename = url.split('/').pop()
  if (!filename) {
    throw new Error('Invalid ipfs url')
  }
  const cacheFilePath = path.join(cacheDir, filename)

  const digest = (await got.default(`${url}.sha512`, { agent: getAgent() }).buffer())
    .slice(0, 128)
    .toString('utf8')
  fs.writeFileSync(cacheFilePath, await got.default(url, { agent: getAgent() }).buffer())

  const hash = hasha.fromFileSync(cacheFilePath, { encoding: 'hex', algorithm: 'sha512' })

  if (digest !== hash) {
    throw new Error(`Expected hash ${digest}, got ${hash}`)
  }

  await new Promise((resolve, reject) => {
    fs.createReadStream(cacheFilePath)
      .pipe(zlib.createGunzip())
      .pipe(tar.extract(dir))
      .on('finish', resolve)
      .on('error', reject)
  })

  return binPath
}

/**
 * Link ipfs binary
 * @param {object} options
 * @param {string} options.localBinPath
 * @param {string} options.binPath
 * @param {string} options.version
 */
function link({ localBinPath, binPath, version }) {
  if (!fs.existsSync(binPath)) {
    throw new Error('ipfs binary not found. maybe go-ipfs did not install correctly?')
  }

  if (fs.existsSync(localBinPath)) {
    fs.unlinkSync(localBinPath)
  }

  fs.symlinkSync(binPath, localBinPath)

  // test ipfs installed correctly.
  var result = spawnSync(localBinPath, ['version'])
  if (result.error) {
    throw new Error('ipfs binary failed: ' + result.error)
  }

  var outstr = result.stdout.toString()
  var m = /ipfs version ([^\n]+)\n/.exec(outstr)

  if (!m) {
    throw new Error('Could not determine IPFS version')
  }

  var actualVersion = `v${m[1]}`

  if (actualVersion !== version) {
    throw new Error(`version mismatch: expected ${version} got ${actualVersion}`)
  }

  return localBinPath
}

/**
 * Install ipfs to node_modules/.bin
 * @param {string} localBinPath install path
 * @param {string} downloadDir download dir
 * @param {string} version ipfs version
 */
async function install(localBinPath, downloadDir, version) {
  const binPath = await download(downloadDir, version)
  link({ localBinPath, binPath, version })
}

install(path.join(__dirname, 'bin', 'ipfs'), __dirname, 'v0.10.0')
