const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronPrinter', {
  printEscPos: (data) => ipcRenderer.invoke('printer:print-escpos', data),
  writeSerial: (bytes) => ipcRenderer.invoke('printer:write-serial', bytes),
});
