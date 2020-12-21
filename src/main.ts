import { BrowserWindow } from 'electron';

class Process {
    static splash: BrowserWindow;
    static main: BrowserWindow;
    static workerScreen: BrowserWindow;
    static confirmDialog: BrowserWindow;
    static srSearchDialog: BrowserWindow;

    static build(window: string, execute?: Function) {
        switch(window) {
            case 'splash':
                Process.splash = new BrowserWindow({
                    "show": false,
                    "frame": false,
                    "width": 300,
                    "height": 300,
                    "resizable": false,
                    "transparent": true,
                    "skipTaskbar": true,
                    "webPreferences": {
                        "nodeIntegration": true,
                        "enableRemoteModule": true
                    }
                });
                Process.splash.loadURL(`${__dirname}/renderer-processes/html/windows/splash.html`);
                Process.splash.once('ready-to-show', () => {
                    Process.splash.show();
                    if (typeof(execute) === 'function') execute();
                });
                break;
            case 'main':
                Process.main = new BrowserWindow({
                    "show": false,
                    "frame": false,
                    "minWidth": 500,
                    "minHeight": 250,
                    "width": 500,
                    "height": 350,
                    "resizable": false,
                    "transparent": true,
                    "webPreferences": {
                        "nodeIntegration": true,
                        "enableRemoteModule": true
                    }
                });
                Process.main.loadURL(`${__dirname}/renderer-processes/html/windows/main.html`);
                Process.main.once('ready-to-show', () => {
                    Process.main.show();
                    if (typeof(execute) === 'function') execute();
                });
                break;
            case 'workerScreen':
                Process.workerScreen = new BrowserWindow({
                    "show": false,
                    "frame": false,
                    "width": 1280,
                    "height": 730,
                    "minWidth": 1280,
                    "minHeight": 730,
                    "resizable": true,
                    "transparent": true,
                    "webPreferences": {
                        "nodeIntegration": true,
                        "enableRemoteModule": true
                    }
                });
                Process.workerScreen.loadURL(`${__dirname}/renderer-processes/html/windows/workerScreen.html`);
                Process.workerScreen.once('ready-to-show', () => {
                    Process.workerScreen.show();
                    if (typeof(execute) === 'function') execute();
                });
                break;
            case 'confirmDialog':
                Process.confirmDialog = new BrowserWindow({
                    "parent": Process.workerScreen,
                    "modal": true,
                    "show": false,
                    "frame": false,
                    "width": 960,
                    "height": 460,
                    "resizable": false,
                    "transparent": true,
                    "webPreferences": {
                        "nodeIntegration": true,
                        "enableRemoteModule": true
                    }
                });
                Process.confirmDialog.loadURL(`${__dirname}/renderer-processes/html/dialogs/confirmDialog.html`);
                Process.confirmDialog.once('ready-to-show', () => {
                    Process.confirmDialog.show();
                });
                break;
            case 'srSearchDialog':
                Process.srSearchDialog = new BrowserWindow({
                    "parent": Process.workerScreen,
                    "modal": true,
                    "show": false,
                    "frame": false,
                    "width": 720,
                    "height": 420,
                    "resizable": false,
                    "transparent": true,
                    "webPreferences": {
                        "nodeIntegration": true,
                        "enableRemoteModule": true
                    }
                });
                Process.srSearchDialog.loadURL(`${__dirname}/renderer-processes/html/dialogs/srSearchDialog.html`);
                Process.srSearchDialog.once('ready-to-show', () => {
                    Process.srSearchDialog.show();
                });
            break;
        }
    }
}

export { Process };

