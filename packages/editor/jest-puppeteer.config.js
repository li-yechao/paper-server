module.exports = {
  server: {
    command: 'yarn vite --port 4444 --strictPort',
    launchTimeout: 30e3,
    port: 4444,
    host: '127.0.0.1',
    protocol: 'tcp',
    usedPortAction: 'kill',
  },
}
