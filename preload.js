const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('openRouter', {
  ask: (message) => ipcRenderer.invoke('openrouter:ask', message),
  setModel: (modelKey) => ipcRenderer.invoke('model:set', modelKey)
})
