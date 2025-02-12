const WebSocket = require('ws')

module.exports = function (port) {
  const webSocketServer = new WebSocket.Server({ host: 'localhost', port })

  webSocketServer.on('connection', (ws) => {
    ws.send(JSON.stringify({ status: 'serverReady' }))
    console.log(
      '\nStarting a new browser instance with your extension set up...\n'
    )

    ws.on('error', (error) => {
      console.log('Error', error)
      webSocketServer.close()
    })

    ws.on('close', () => {
      console.log('Watch mode closed. Exiting...\n')
      webSocketServer.close()
    })

    // We're only ready when the extension says so
    ws.on('message', (msg) => {
      const message = JSON.parse(msg)

      if (message.status === 'clientReady') {
        console.log('Browser setup completed! Extension loaded.\n')
      }

      if (message.status === 'extensionReloaded') {
        console.log(
          'Extension reloaded. Watching for changes...\n'
        )
      }

      if (message.status === 'tabReloaded') {
        console.log(
          'Extension tab reloaded. Watching for changes...\n'
        )
      }

      if (message.status === 'allTabsReloaded') {
        console.log(
          'All tabs reloaded. Watching for changes...\n'
        )
      }

      if (
        message.status === 'extensionReloaded' &&
        message.status === 'allTabsReloaded'
      ) {
        console.log(
          'Extension and tabs reloaded. Watching for changes...\n'
        )
      }
    })
  })

  return webSocketServer
}
