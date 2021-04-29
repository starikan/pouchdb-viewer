const path = require('path');
const fs = require('fs');

const { app, BrowserWindow, ipcMain } = require('electron');
const electron = require('electron');
const PouchDB = require('pouchdb');

function createWindow() {
  const screenDimensions = electron.screen.getPrimaryDisplay().workAreaSize;
  const mainWindow = new BrowserWindow({
    width: screenDimensions.width,
    height: screenDimensions.height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
    autoHideMenuBar: true,
  });
  mainWindow.maximize();

  mainWindow.loadFile('index.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

const logger = (text) => {
  const parentPath = process.env.PORTABLE_EXECUTABLE_DIR ? process.env.PORTABLE_EXECUTABLE_DIR : path.resolve('.');
  fs.appendFileSync(path.join(parentPath, 'loggerPouchViewer.txt'), text + '\n');
  console.log(text);
};

function getUserData() {
  const parentPath = process.env.PORTABLE_EXECUTABLE_DIR ? process.env.PORTABLE_EXECUTABLE_DIR : path.resolve('.');
  const basePath = path.join(parentPath, 'pouchDB') + '/';
  logger('parentPath: ' + parentPath);
  logger('basePath: ' + basePath);
  return basePath;
}

const runViewer = () => {
  try {
    const server = require('express-pouchdb')(PouchDB.defaults({ prefix: getUserData() }), {});
    server.listen(5588);
    logger('Viewer: http://localhost:5588/_utils');
    logger(`Base Path: ${getUserData()}`);
  } catch (error) {
    logger(error);
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  runViewer();

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
