const { BrowserWindow, app, ipcMain } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    kiosk: process.env.ELECTRON_KIOSK === 'true',
    webPreferences: {
      preload: `${__dirname}/preload.js`,
    },
  });

  void win.loadURL(process.env.LAKO_WEB_URL || 'http://localhost:3000');
}

ipcMain.handle('printer:print-escpos', async (_event, data) => {
  // Production deployments can replace this with serialport writes.
  process.stdout.write(data);
  return true;
});

ipcMain.handle('printer:write-serial', async (_event, bytes) => {
  process.stdout.write(Buffer.from(bytes));
  return true;
});

void app.whenReady().then(createWindow);
