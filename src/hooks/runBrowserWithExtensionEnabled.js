// Ideas here are adapted from
// https://github.com/jeremyben/webpack-chrome-extension-launcher
// Released under MIT license.
const { exec } = require('child_process')
const chrome = require('chrome-location')

const browserConfig = require('../chrome/browser.config')
const createUserDataDir = require('../chrome/createUserDataDir')
const generateReloadExtension = require('../chrome/generateReloadExtension')

// TODO: check if still needed
process.on('SIGINT', () => {
  process.exit()
})

process.on('SIGTERM', () => {
  process.exit()
})

async function launchChrome (options = {}) {
  generateReloadExtension(options.port)

  // Get user defaults so we can set the browser flags
  const configOptions = {
    autoReload: options.autoReload || false,
    browserFlags: options.browserFlags || [],
    userDataDir: options.userDataDir || createUserDataDir()
  }

  const chromeLaunchPath = options.startingUrl
    ? `"${chrome}" "${options.startingUrl}"`
    : `"${chrome}"`

  // Set user defaults to browser
  const chromeConfig = browserConfig(options.extensionPath, configOptions)
  const cmd = `${chromeLaunchPath} ${chromeConfig}`

  return new Promise(() => {
    const child = exec(cmd, (error, stdout, stderr) => {
      if (error) throw error
      if (stderr.includes('Unable to move the cache')) {
        console.log(`[Chrome Extension Launcher] Chrome instance already running`)
      } else {
        console.log('[Chrome Extension Launcher] Chrome instance exited')
        process.exit()
      }
    })
    child.stdout.pipe(process.stdout)
    child.stderr.pipe(process.stderr)
  })
}

let chromeDidLaunch = false

function runBrowserWithExtensionEnabled (compiler, options) {

  return compiler
    .hooks.afterEmit.tapAsync('run-chrome-extension', (_, done) => {
    if (chromeDidLaunch) return done()
    launchChrome(options)
    chromeDidLaunch = true
    done()
  })
}

module.exports = {launchChrome, runBrowserWithExtensionEnabled}
