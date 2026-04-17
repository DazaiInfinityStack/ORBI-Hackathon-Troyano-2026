var electron = require('electron')
electron.app.on('ready', function () {
  var mainWindow = new electron.BrowserWindow({
    width: 600, 
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  require('@electron/remote/main').initialize()
  require('@electron/remote/main').enable(mainWindow.webContents)
  mainWindow.loadURL('file://' + __dirname + '/index.html')
})