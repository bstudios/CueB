import { app, BrowserWindow, ipcMain, Menu } from "electron";
import path from "path";
import { server } from "./server";
import { Database } from "./db/database";
import { OSC } from "./osc";
import { getDevices } from "./db/controllers/devices";
import { getAvailablePort } from "./utils/findAvailablePort";
import { ServerAccessData } from "./utils/ServerAccessData";
import ip from "ip";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 960,
    height: 540,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  const name = app.getName();
  app.setAboutPanelOptions({
    applicationName: "CueB",
    applicationVersion: app.getVersion(),
    version: app.getVersion(),
    credits: "",
    copyright: "©2024 James Bithell",
  });
  const macMenu: Electron.MenuItemConstructorOptions[] = [
    {
      label: name,
      submenu: [
        {
          label: "About " + name,
          role: "about",
        },
        {
          type: "separator",
        },
        {
          label: "Services",
          role: "services",
        },
        {
          type: "separator",
        },
        {
          label: "Hide " + name,
          accelerator: "Command+H",
          role: "hide",
        },
        {
          label: "Show All",
          role: "unhide",
        },
        {
          type: "separator",
        },
        {
          label: "Quit",
          accelerator: "Command+Q",
          click: function () {
            app.quit();
          },
        },
      ],
    },
  ];
  if (process.platform == "darwin") {
    const menu = Menu.buildFromTemplate(macMenu);
    Menu.setApplicationMenu(menu);
  } else {
    Menu.setApplicationMenu(null);
  }
  mainWindow.setResizable(true);

  new Database(
    app.isPackaged
      ? app.getPath("userData") + "/sqlite.db"
      : path.join(__dirname, "../../sqlite.db")
  );
  const serverAccessData: ServerAccessData = {
    OSCPorts: [],
    WebServerPort: 0,
    IPAddress: ip.address(undefined, "ipv4"),
  };
  getAvailablePort(53100)
    .then((port) => {
      serverAccessData.OSCPorts.push(port);
    })
    .then(() => getAvailablePort(8080))
    .then((port) => {
      serverAccessData.WebServerPort = port;
      new OSC(serverAccessData.OSCPorts);
      server.listen(serverAccessData.WebServerPort);
      return getDevices();
    })
    .then((devices) => {
      devices.forEach((device) => {
        OSC.createClient(device.id, device.ip, device.port);
      });
      // Once Servers are running, load load the index.html of the app.
      if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
        mainWindow.webContents.openDevTools();
      } else {
        mainWindow.loadFile(
          path.join(
            __dirname,
            `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`
          )
        );
      }
      ipcMain.on("requestServerAccessData", (event, arg) => {
        event.reply("serverAccessData", serverAccessData);
      });
    });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
// We don't want to use this behavior, and have it properly quit on all platforms.
app.on("window-all-closed", () => {
  //if (process.platform !== "darwin")
  app.quit();
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
