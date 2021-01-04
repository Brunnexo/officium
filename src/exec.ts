import { app, ipcMain as ipc } from 'electron';
import * as fs from 'fs';
import { Process } from './main';


fs.readFile('./data/Parameters.json', 'utf-8', (err, data) => { global['parameters'] = JSON.parse(data) });
fs.readFile('./data/Activities.json', 'utf-8', (err, data) => { global['activities'] = JSON.parse(data) });
fs.readFile('./data/Clients.json', 'utf-8', (err, data) => { global['clients'] = JSON.parse(data) });

global['sql'] = {
    department: {},
    projects: {},
    srs: {},
    general: {}
}
global['data'] = {};
global['data'].worker = {};

app.on('ready', () => {
    Process.build('splash');
});

app.on('window-all-closed', () => {
    app.exit();
});

let labor_info: any,
    badge: string;
let worker_screen_evt: Electron.IpcMainEvent;

interface DialogOptions {
    title: string,
    type: 'yes-no' | 'info',
    content: string
}

let dialog_opt: DialogOptions;

ipc.on('show-main', (evt, arg) => {
    Process.build('main', () => { Process[arg].destroy() });
});

ipc.on('show-worker-screen', (evt, arg) => {
    Process.build('worker_screen', () => { Process[arg].destroy() })
});

ipc.on('select-project', (evt, arg) => {
    worker_screen_evt = evt;
    badge = arg.badge;
    labor_info = arg.info;
    Process.build('select_project');
});

ipc.on('request-labor-info', evt => {
    evt.returnValue = labor_info;
});

ipc.on('request-badge-name', evt => {
    evt.returnValue = badge;
});

ipc.on('sr-search', (evt, arg) => {
    worker_screen_evt = evt;
    Process.build('sr_search');
});

ipc.on('sr-found', (evt, arg) => {
    worker_screen_evt.reply('sr-fill', arg);
});

ipc.on('project-selected', (evt, arg) => {
    worker_screen_evt.reply('reg-time', arg);
});

ipc.on('show-dialog', (evt, arg: DialogOptions) => {
    worker_screen_evt = evt;
    dialog_opt = arg;
    Process.build('dialog');
});

ipc.on('dialog-closed', (evt, res: boolean) => {
    worker_screen_evt.reply('dialog-reply', res);
});

ipc.on('get-dialog-options', (evt, arg) => {
    evt.returnValue = dialog_opt;
});