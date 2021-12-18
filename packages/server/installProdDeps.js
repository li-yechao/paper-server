const { spawnSync } = require('child_process')
const os = require('os')

let arch = os.arch()
if (arch === 'x64') {
  arch = 'amd64'
}

spawnSync('yarn', ['install', '--prod'], {
  env: {
    ...process.env,
    TARGET_ARCH: arch,
  },
  stderr: process.stderr,
  stdout: process.stdout,
})

spawnSync('yarn', ['cache', 'clean'])

spawnSync('rm', ['-rf', '~/.cache'])
