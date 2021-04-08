const electron = require('electron')
const {Menu} = require('electron')
const {dialog} = require('electron')
const os = require("os")
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const persistentSettings = require('electron-settings');

var debugShow = true;

const path = require('path')
const url = require('url')

const template = [
    {
        label: 'File',
        submenu: [
            {
                label: 'New',
                click () {
                    mainWindow.webContents.send('newFile');
                }
            },
            { type: 'separator' },
            {
                label: 'Open',
                click () {
                    dialog.showOpenDialog(
                        {
                            title:"Choose a Show File",
                            properties: [ 'openFile' ], filters: [{ name: 'CueB ShowFile', extensions: ['cuebsf'] }]
                        }, function (filePaths) {
                            if (filePaths) {
                                mainWindow.webContents.send('fileOpen',filePaths);
                            }
                        }
                        );
                }
            },
            {
                label: 'Save',
                click () {
                    dialog.showSaveDialog(
                        {
                            title:"Choose where to save your Show File",
                           filters: [{ name: 'CueB ShowFile', extensions: ['cuebsf'] }]
                        }, function (filename) {
                            if (filename) {
                                mainWindow.webContents.send('fileSave',filename);
                            }
                        }
                    );
                }
            }
        ]
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'About',
                role: 'about',
                click () {
                    dialog.showMessageBox(
                        {
                            "type":"info",
                            "buttons": [],
                            "title":"CueB Controller Software",
                            "message":"©2018-2019 James Bithell",
                            "detail":"A Bithell Studios Project.\nVersion " + app.getVersion() + "\n\n Contact hi@jbithell.com for support",
                        });
                }
            }
        ]
    }
]

if (process.platform === 'darwin') {
    template.unshift({
        label: app.getName(),
        submenu: [
            { role: 'hide' },
            { role: 'hideothers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    })
}

const menu = Menu.buildFromTemplate(template)


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainStartWindow;
let mainWindow;
let comPort = "";
global.comPort = comPort;
let socketPort = "";
global.socketPort = socketPort;
global.createWindow = function(comPortVar, socketPortVar) {
    // Create the browser window.
    global.comPort = comPortVar;
    global.socketPort = socketPortVar;
    mainWindow = new BrowserWindow({
        width: 800,
        height: 480,
        minWidth: 800,
        minHeight: 480,
        fullscreen: (os.platform() == "linux"),
        resizable: debugShow,
        title: "CueB",
        icon: path.join(__dirname, 'assets/icon/scaled/64x64.png')
    });
    Menu.setApplicationMenu(menu)


    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'control.html'),
        protocol: 'file:',
        slashes: true
    }));

    //mainWindow.maximize();
    mainWindow.focus();
    mainStartWindow.destroy(); //Close the other window

	  // Open the DevTools.
    if (debugShow) {
        mainWindow.webContents.openDevTools()
    }
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

function createStartWindow () {
  // Create the browser window.
  mainStartWindow = new BrowserWindow({
      width: 800,
      height: 480,
      fullscreen: (os.platform() == "linux"),
      frame: false
  })
  mainStartWindow.setMenu(null);
  // and load the index.html of the app.
  mainStartWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));
  if (debugShow) {
      mainStartWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainStartWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainStartWindow = null
  })
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createStartWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  app.quit()
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createStartWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
