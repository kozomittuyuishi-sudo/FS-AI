const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

const isDev = process.env.NODE_ENV === 'development'

/** @type {BrowserWindow | null} */
let win = null

function createWindow() {
  win = new BrowserWindow({
    width: 1320,
    height: 840,
    minWidth: 1040,
    minHeight: 680,
    backgroundColor: '#f6f1ee',
    title: 'FSAI — FashionSense AI',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // Secure defaults: renderer never touches Node or Electron APIs directly.
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  if (isDev) {
    win.loadURL('http://localhost:3000')
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  win.on('closed', () => { win = null })
}

// ── IPC: Renderer ready signal ────────────────────────────────────────────────
// When the React app mounts it sends 'fsai:state-ready'.
// We can use this hook to push an initial state if needed.
ipcMain.on('fsai:state-ready', (_event) => {
  // Currently a no-op; reserved for future use where main may push
  // an initial state derived from persisted app settings.
})

// ── IPC: External state setter ────────────────────────────────────────────────
// Any process with access to main (e.g. a Python subprocess communicating
// via stdio) can set the UI state by triggering this handler.
//
// Example — set state to THINKING from within main.js at any point:
//
//   win.webContents.send('fsai:state-change', { state: 'THINKING', meta: {} })
//
// Future Python bridge pattern:
//   pythonProcess.stdout.on('data', (raw) => {
//     try {
//       const msg = JSON.parse(raw)
//       if (msg.type === 'state' && win) {
//         win.webContents.send('fsai:state-change', { state: msg.state, meta: msg.meta })
//       }
//     } catch (_) {}
//   })
ipcMain.on('fsai:set-state', (_event, { state, meta } = {}) => {
  if (win && state) {
    win.webContents.send('fsai:state-change', { state, meta: meta ?? {} })
  }
})

// ── App lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
