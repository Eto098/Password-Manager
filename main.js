const { app, BrowserWindow, Menu } = require('electron')
Menu.setApplicationMenu(false)

function createWindow () {
  const win = new BrowserWindow({
    frame: true,
    width: 1024,
    height: 720,
    webPreferences: {
      contextIsolation: true
    }
  })

  //win.loadFile('index.html')
  win.loadFile('page.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
