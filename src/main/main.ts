/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  dialog,
  crashReporter,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { killMainProcess, resolveHtmlPath } from './util';
import { run as runClientCheck } from './check-client-update';
import runMu from './run-mu';
import {
  EVENT_CHECK_CLIENT_UPDATE,
  EVENT_GET_REGEDIT,
  EVENT_KILL_MAIN,
  EVENT_RUN_MU,
  EVENT_SELECT_FOLDER,
  EVENT_SET_REGEDIT,
} from '../config';
import { getRegedit, setRegedit } from './regedit';
import store from './store';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('--no-sandbox');

// app.commandLine.appendSwitch('disable-software-rasterizer')
// app.commandLine.appendSwitch('disable-gpu')
// app.commandLine.appendSwitch('disable-gpu-compositing')
// app.commandLine.appendSwitch('disable-gpu-rasterization')
// app.commandLine.appendSwitch('disable-gpu-sandbox')
// app.disableHardwareAcceleration();

// console.log(app.getPath('crashDumps'))
// crashReporter.start({ submitURL: '', uploadToServer: false })

let mainWindow: BrowserWindow | null = null;

ipcMain.on('electron-store-get', async (event, value) => {
  event.returnValue = store.get(value);
});

ipcMain.on('electron-store-set', async (event, key, value) => {
  store.set(key, value);
});

ipcMain.on(EVENT_RUN_MU, async () => {
  runMu();
});

ipcMain.on(EVENT_CHECK_CLIENT_UPDATE, async (event, args) => {
  runClientCheck(event, args);
});

ipcMain.on(EVENT_KILL_MAIN, async (event) => {
  killMainProcess();
});

ipcMain.on(EVENT_GET_REGEDIT, async (event) => {
  getRegedit()
    .then((result: any) => {
      event.reply(
        EVENT_GET_REGEDIT,
        result['HKCU\\Software\\Webzen\\Mu\\Config'].values
      );
    })
    .catch((err: any) => {
      console.log(err);
    });
});

ipcMain.on(EVENT_SET_REGEDIT, async (event, args) => {
  setRegedit(args[0])
    .then(() => {
      event.reply(EVENT_SET_REGEDIT, '');
    })
    .catch((err: any) => {
      console.log(err);
    });
});

ipcMain.on(EVENT_SELECT_FOLDER, async (event) => {
  const folders = await dialog.showOpenDialog({
    properties: ['openFile'],
  });

  event.reply(EVENT_SELECT_FOLDER, folders);
});

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 320,
    height: 525,
    icon: getAssetPath('icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      nodeIntegration: true,
      webSecurity: false,
      sandbox: false,
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
