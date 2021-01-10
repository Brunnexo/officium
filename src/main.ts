import { BrowserWindow } from 'electron';

class Process {
    static splash: BrowserWindow;
    static main: BrowserWindow;
    static worker_screen: BrowserWindow;
    static sr_search: BrowserWindow;
    static select_project: BrowserWindow;
    static dialog: BrowserWindow;
    static forgot_password: BrowserWindow;

    static build(window: string, execute?: Function) {
        switch(window) {
            case 'splash':
                Process.splash = new BrowserWindow({
                    "show": false,
                    "frame": false,
                    "width": 300,
                    "height": 300,
                    "resizable": false,
                    "maximizable": false,
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
                    "maximizable": false,
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
            case 'worker_screen':
                Process.worker_screen = new BrowserWindow({
                    "show": false,
                    "frame": false,
                    "width": 1350,
                    "height": 730,
                    "resizable": false,
                    "maximizable": false,
                    "transparent": true,
                    "webPreferences": {
                        "nodeIntegration": true,
                        "enableRemoteModule": true
                    }
                });
                Process.worker_screen.loadURL(`${__dirname}/renderer-processes/html/windows/worker_screen.html`);
                Process.worker_screen.once('ready-to-show', () => {
                    setTimeout(() => {
                        Process.worker_screen.show();
                        if (typeof(execute) === 'function') execute();
                    }, 1000);
                });
            break;
            case 'sr_search':
                Process.sr_search = new BrowserWindow({
                    "parent": Process.worker_screen,
                    "modal": true,
                    "show": false,
                    "frame": false,
                    "width": 720,
                    "height": 420,
                    "resizable": false,
                    "maximizable": false,
                    "transparent": true,
                    "webPreferences": {
                        "nodeIntegration": true,
                        "enableRemoteModule": true
                    }
                });
                Process.sr_search.loadURL(`${__dirname}/renderer-processes/html/dialogs/sr_search.html`);
                Process.sr_search.once('ready-to-show', () => {
                    Process.sr_search.show();
                });
            break;
            case 'select_project':
                Process.select_project = new BrowserWindow({
                    "parent": Process.worker_screen,
                    "modal": true,
                    "show": false,
                    "frame": false,
                    "width": 960,
                    "height": 560,
                    "resizable": false,
                    "maximizable": false,
                    "transparent": true,
                    "webPreferences": {
                        "nodeIntegration": true,
                        "enableRemoteModule": true
                    }
                });
                Process.select_project.loadURL(`${__dirname}/renderer-processes/html/dialogs/select_project.html`);
                Process.select_project.once('ready-to-show', () => {
                    Process.select_project.show();
                });
            break;
            case 'dialog':
                Process.dialog = new BrowserWindow({
                    "parent": Process.worker_screen,
                    "modal": true,
                    "show": false,
                    "frame": false,
                    "width": 720,
                    "height": 360,
                    "resizable": false,
                    "maximizable": false,
                    "transparent": true,
                    "webPreferences": {
                        "nodeIntegration": true,
                        "enableRemoteModule": true
                    }
                });
                Process.dialog.loadURL(`${__dirname}/renderer-processes/html/dialogs/dialog.html`);
                Process.dialog.once('ready-to-show', () => {
                    Process.dialog.show();
                });
            break;
            case 'forgot_password':
                Process.forgot_password = new BrowserWindow({
                    "parent": Process.main,
                    "modal": true,
                    "show": false,
                    "frame": false,
                    "width": 620,
                    "height": 380,
                    "resizable": false,
                    "maximizable": false,
                    "transparent": true,
                    "webPreferences": {
                        "nodeIntegration": true,
                        "enableRemoteModule": true
                    }
                });
                Process.forgot_password.loadURL(`${__dirname}/renderer-processes/html/dialogs/forgot_password.html`);
                Process.forgot_password.once('ready-to-show', () => {
                    Process.forgot_password.show();
                });
            break;
        }
    }
}

export { Process };

