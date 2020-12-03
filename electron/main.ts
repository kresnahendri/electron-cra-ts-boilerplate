/* eslint-disable import/no-extraneous-dependencies */
import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  MenuItem,
  MenuItemConstructorOptions,
  MessageBoxReturnValue,
} from "electron";
import * as isDev from "electron-is-dev";
import {autoUpdater} from "electron-updater";
import * as path from "path";
import {clone} from "ramda";
import * as url from "url";

let mainWindow: Electron.BrowserWindow | null;
let isSilent: boolean;
let updateDownloaded = false;

const menuTemplate: (MenuItemConstructorOptions | MenuItem)[] = [
  {
    label: app.getName(),
    submenu: [
      {role: "about"},
      {label: `Version ${app.getVersion()}`, enabled: false},
      {
        label: "Check for updates",
        enabled: false,
        click: () => checkForUpdates({silent: false}),
      },
      {type: "separator"},
      {role: "services"},
      {type: "separator"},
      {role: "hide"},
      {role: "hideOthers"},
      {role: "unhide"},
      isDev ? {role: "toggleDevTools"} : {type: "separator"},
      {role: "quit"},
    ],
  },
];

Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

export function checkForUpdates({silent}: {silent: boolean}) {
  isSilent = silent;
  changeUpdaterMenu({label: "Checking for updates...", enabled: false});
  if (updateDownloaded) {
    dialog
      .showMessageBox({
        title: "Available Updates",
        message: "New updates are available and ready to be installed.",
        defaultId: 0,
        cancelId: 1,
        buttons: ["Install and restart", "Close"],
      })
      .then(({response: buttonIndex}: MessageBoxReturnValue) => {
        if (buttonIndex === 0) {
          setImmediate(() => autoUpdater.quitAndInstall());
        } else {
          changeUpdaterMenu({label: "Updates available", enabled: true});
        }
      });
  } else {
    autoUpdater.checkForUpdates();
  }
}
const changeUpdaterMenu = ({
  label,
  enabled,
}: {
  label: string;
  enabled: boolean;
}) => {
  const newTemplate = clone(menuTemplate);
  if (
    newTemplate[0]?.submenu &&
    Array.isArray(newTemplate[0]?.submenu) &&
    newTemplate[0]?.submenu[2]
  ) {
    newTemplate[0].submenu[2].label = label;
    newTemplate[0].submenu[2].enabled = enabled;
  }
  const menu = Menu.buildFromTemplate(newTemplate);
  Menu.setApplicationMenu(menu);
};
const sendStatusToWindow = (text: string) => {
  mainWindow?.webContents.send("message", text);
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
  } else {
    checkForUpdates({silent: true});
    mainWindow.loadURL(
      url.format(`file://${path.join(__dirname, "../index.html")}`),
    );
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

  autoUpdater.autoDownload = false;

  autoUpdater.on("checking-for-update", () => {
    sendStatusToWindow("Checking for update...");
  });
  autoUpdater.on("error", (error) => {
    sendStatusToWindow(`Error in autoUpdater. ${error}`);
    changeUpdaterMenu({label: "Check for updates", enabled: true});
    if (isSilent) return;
    dialog.showErrorBox(
      "Error during the update",
      "Application couldn't be updated. Please try again or contact the support team.",
    );
  });
  autoUpdater.on("update-available", () => {
    sendStatusToWindow("Update available.");
    if (isSilent) {
      autoUpdater.downloadUpdate();
      return;
    }
    dialog
      .showMessageBox({
        type: "info",
        title: "Found Updates",
        message: "New updates are available, do you want update now?",
        defaultId: 0,
        cancelId: 1,
        buttons: ["Yes", "No"],
      })
      .then(({response: buttonIndex}: MessageBoxReturnValue) => {
        if (buttonIndex === 0) {
          autoUpdater.downloadUpdate();
        } else {
          changeUpdaterMenu({label: "Check for updates", enabled: true});
        }
      });
  });
  autoUpdater.on("update-not-available", () => {
    sendStatusToWindow("Update not available.");
    changeUpdaterMenu({label: "Check for updates", enabled: true});
    if (isSilent) return;
    dialog.showMessageBox({
      title: "No Updates",
      message: "Current version is up-to-date.",
    });
  });
  autoUpdater.on("update-downloaded", () => {
    sendStatusToWindow("Update downloaded.");
    updateDownloaded = true;
    changeUpdaterMenu({label: "Updates available", enabled: true});
    if (isSilent) return;
    dialog
      .showMessageBox({
        title: "Install Updates",
        message: "Updates are ready to be installed.",
        defaultId: 0,
        cancelId: 1,
        buttons: ["Install and restart", "Close"],
      })
      .then(({response: buttonIndex}: MessageBoxReturnValue) => {
        if (buttonIndex === 0) {
          setImmediate(() => autoUpdater.quitAndInstall());
        } else {
          changeUpdaterMenu({label: "Updates available", enabled: true});
        }
      });
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
