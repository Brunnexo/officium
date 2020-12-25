"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Process = void 0;
const electron_1 = require("electron");
class Process {
    static build(window, execute) {
        switch (window) {
            case 'splash':
                Process.splash = new electron_1.BrowserWindow({
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
                    if (typeof (execute) === 'function')
                        execute();
                });
                break;
            case 'main':
                Process.main = new electron_1.BrowserWindow({
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
                    if (typeof (execute) === 'function')
                        execute();
                });
                break;
            case 'worker_screen':
                Process.worker_screen = new electron_1.BrowserWindow({
                    "show": false,
                    "frame": false,
                    "width": 1280,
                    "height": 730,
                    "minWidth": 1130,
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
                    if (typeof (execute) === 'function')
                        execute();
                });
                break;
            case 'confirm':
                Process.confirm = new electron_1.BrowserWindow({
                    "parent": Process.worker_screen,
                    "modal": true,
                    "show": false,
                    "frame": false,
                    "width": 960,
                    "height": 400,
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
                Process.sr_search = new electron_1.BrowserWindow({
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
        }
    }
}
exports.Process = Process;
