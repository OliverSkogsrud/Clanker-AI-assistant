const path = require('node:path')
const { app, BrowserWindow, ipcMain } = require('electron')
const { error } = require('node:console')

const allowedModels = new Set([
  'nvidia/nemotron-3.5-lightning:free',
  'nvidia/nemotron-3.5-super-vl:free',
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'cohere/north-mini-code:free'
])

let selectedModelOption = 'nvidia/nemotron-3.5-lightning:free'

let mainWindow

async function askOpenRouter(message) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('Set the OPENROUTER_API_KEY environment variable before starting the app.')
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: selectedModelOption,
      messages: [{ role: 'user', content: message }],
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenRouter request failed (${response.status}): ${await response.text()}`)
  }

  const data = await response.json()
  const answer = data.choices?.[0]?.message?.content
  if (typeof answer !== 'string') {
    throw new Error('OpenRouter returned a response without message text.')
  }

  return answer
}

ipcMain.handle('openrouter:ask', async (event, message) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) {
    throw new Error('Request came from an untrusted window.')
  }
  if (typeof message !== 'string' || !message.trim() || message.length > 4000) {
    throw new Error('Enter a message between 1 and 4000 characters.')
  }

  return askOpenRouter(message.trim())
})

ipcMain.handle('model:set', async (event, modelKey) => {
  if (!mainWindow || event.sender !== mainWindow.webContents)
  {
    throw error('Sent from untrusted window ')
  }
  if (!allowedModels.has(modelKey)) {
    throw error('Unknown model selection')
  }

  selectedModelOption = modelKey

})

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 1000,
    minHeight: 600,
    minWidth: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })
  mainWindow.loadFile('index.html')
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
