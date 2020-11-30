// eslint-disable-next-line import/no-extraneous-dependencies
import {app, BrowserWindow, ipcMain} from "electron";
import {autoUpdater} from "electron-updater";
import * as path from "path";
import * as url from "url";

let mainWindow: Electron.BrowserWindow | null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV === "production") {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, "../build/index.html"),
        protocol: "file:",
        slashes: true,
      }),
    );
  } else {
    mainWindow.loadURL("http://localhost:3000");
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.once("ready-to-show", () => {
    autoUpdater.checkForUpdatesAndNotify();
  });

  autoUpdater.on("update-available", () => {
    mainWindow?.webContents.send("update_available");
  });
  autoUpdater.on("update-downloaded", () => {
    mainWindow?.webContents.send("update_downloaded");
  });
}

app.on("ready", createWindow);

// IPC Listeners
ipcMain.on("app_version", (event) => {
  event.sender.send("app_version", {version: app.getVersion()});
});

ipcMain.on("restart_app", () => {
  autoUpdater.quitAndInstall();
});

app.allowRendererProcessReuse = true;
