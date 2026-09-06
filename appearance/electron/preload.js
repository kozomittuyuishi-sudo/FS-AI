const { contextBridge, ipcRenderer } = require('electron')

/**
 * This bridge is intentionally minimal for the Appearance module.
 * It exists so that later FSAI modules (Brain, Vision, Memory, Stylist,
 * Wardrobe, etc.) have a single, controlled channel to reach the UI
 * instead of the renderer getting raw Node/Electron access.
 *
 * Nothing here fakes AI behavior — it's just plumbing.
 */
contextBridge.exposeInMainWorld('fsai', {
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },

  // Renderer -> main (allow-listed channels only)
  send: (channel, payload) => {
    const allowedChannels = ['fsai:appearance-event']
    if (allowedChannels.includes(channel)) {
      ipcRenderer.send(channel, payload)
    }
  },

  // main -> renderer (allow-listed channels only), returns an unsubscribe fn
  on: (channel, callback) => {
    const allowedChannels = ['fsai:module-message']
    if (!allowedChannels.includes(channel)) return () => {}
    const listener = (_event, data) => callback(data)
    ipcRenderer.on(channel, listener)
    return () => ipcRenderer.removeListener(channel, listener)
  },
})
