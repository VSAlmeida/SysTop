const { BrowserWindow } = require('electron');

class MainWindow extends BrowserWindow {
  constructor(file, isDev) {
    super({
      title: 'SysTop | System Monitor',
      width: isDev ? 800 : 355,
      height: 500,
      icon: `${__dirname}/assets/icons/icon.png`,
      resizable: isDev ? true : false,
      opacity: 0.9,
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
        enableRemoteModule: true,
      },
    });

    if (isDev) {
      this.webContents.openDevTools();
    }

    this.loadFile(file);
  }
}

module.exports = MainWindow;
