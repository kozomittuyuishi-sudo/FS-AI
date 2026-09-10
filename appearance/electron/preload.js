const { contextBridge, ipcRenderer } = require('electron')

/**
 * preload.js
 *
 * The secure bridge between the Electron main process and the React renderer.
 * contextIsolation remains true; nodeIntegration remains false.
 *
 * CHANNEL CATALOGUE
 * ─────────────────
 * Renderer → Main  (send)
 *   fsai:appearance-event   General UI events (nav, interaction tracking)
 *   fsai:state-ready        Renderer signals it is mounted and ready for state
 *
 * Main → Renderer  (on)
 *   fsai:state-change       { state: string, meta?: object }
 *                           Main process (or Python bridge) sets UI state.
 *   fsai:module-message     { module: string, payload: any }
 *                           Generic module-to-UI messages.
 *
 * FUTURE PYTHON INTEGRATION
 * ─────────────────────────
 * When the Python brain is wired up, the flow is:
 *   Python → stdin/stdout or socket → main.js ipcMain handler
 *   → win.webContents.send('fsai:state-change', { state: 'THINKING' })
 *   → preload receives it → window.fsai.on callback fires
 *   → FSAIContext dispatches SET_STATE → React re-renders
 *
 * Nothing in the renderer touches Node or Electron APIs directly.
 */
contextBridge.exposeInMainWorld('fsai', {
  versions: {
    electron: process.versions.electron,
    chrome:   process.versions.chrome,
    node:     process.versions.node,
  },

  // ── Renderer → Main ────────────────────────────────────────────────────────
  send: (channel, payload) => {
    const allowed = [
      'fsai:appearance-event',
      'fsai:state-ready',
    ]
    if (allowed.includes(channel)) {
      ipcRenderer.send(channel, payload)
    }
  },

  // ── Main → Renderer ────────────────────────────────────────────────────────
  // Returns an unsubscribe function so React effects can clean up properly.
  on: (channel, callback) => {
    const allowed = [
      'fsai:state-change',
      'fsai:module-message',
    ]
    if (!allowed.includes(channel)) return () => {}
    const listener = (_event, data) => callback(data)
    ipcRenderer.on(channel, listener)
    return () => ipcRenderer.removeListener(channel, listener)
  },
})
