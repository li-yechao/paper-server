module.exports = {
  server: {
    command: 'yarn vite --port 4444 --strictPort',
    port: 4444,
    host: '127.0.0.1',
    protocol: 'tcp',
    usedPortAction: 'kill',
  },
  browserContext: 'incognito',
}
