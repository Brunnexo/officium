import { BrowserWindow } from 'electron';

class Process {
    static splash: BrowserWindow;
    static main: BrowserWindow;
    static worker_screen: BrowserWindow;
    static confirm: BrowserWindow;
    static sr_search: BrowserWindow;
    static select_project: BrowserWindow;

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
            case 'worker_screen':
                Process.worker_screen = new BrowserWindow({
                    "show": false,
                    "frame": false,
                    "width": 1350,
                    "height": 730,
                    "minWidth": 1350,
                    "minHeight": 720,
                    "resizable": true,
                    "transparent": true,
                    "webPreferences": {
                        "nodeIntegration": true,
                        "enableRemoteModule": true
                    }
                });
                Process.worker_screen.loadURL(`${__dirname}/renderer-processes/html/windows/worker_screen.html`);
                Process.worker_screen.once('ready-to-show', () => {
                    Process.worker_screen.show();
                    if (typeof(execute) === 'function')  execute() ;
                });
                break;
            case 'confirm':
                Process.confirm = new BrowserWindow({
                    "parent": Process.worker_screen,
                    "modal": true,
                    "show": false,
                    "frame": false,
                    "width": 960,
                    "height": 530,
                    "resizable": false,
                    "transparent": true,
                    "webPreferences": {
                        "nodeIntegration": true,
                        "enableRemoteModule": true
                    }
                });
                Process.confirm.loadURL(`${__dirname}/renderer-processes/html/dialogs/confirm.html`);
                Process.confirm.once('ready-to-show', () => {
                    Process.confirm.show();
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
        }
    }
}

export { Process };

