import { app, ipcMain as ipc } from 'electron';
import * as fs from 'fs';
import { Process } from './main';

fs.readFile('officium-modules/data/Parameters.json', 'utf-8', (err, data) => { global['parameters'] = JSON.parse(data) });
fs.readFile('officium-modules/data/Activities.json', 'utf-8', (err, data) => { global['activities'] = JSON.parse(data) });
fs.readFile('officium-modules/data/Clients.json', 'utf-8', (err, data) => { global['clients'] = JSON.parse(data) });

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

interface DialogOptions {
    title: string,
    type: 'yes-no' | 'info',
    content: string
}

const ElectronEvent = {
    show_main: function(evt: Electron.IpcMainEvent, arg: string) {
        Process.build('main', () => { Process[arg].destroy() });
    },
    show_worker_screen: function(evt: Electron.IpcMainEvent, arg: string) {
        Process.build('worker_screen', () => { Process[arg].destroy() });
    },
    select_project: function(evt: Electron.IpcMainEvent, arg: { badge: string; info: any; }) {
        this.evt_caller = evt;
        this.badge = arg.badge;
        this.info = arg.info;
        Process.build('select_project');
        ipc.once('request-labor-info', evt => evt.returnValue = this.info);
        ipc.once('request-badge-name', evt => evt.returnValue = this.badge);
        ipc.once('project-selected', (evt, arg) => { this.evt_caller.reply('reg-time', arg) } );
    },
    sr_search: function(evt: Electron.IpcMainEvent) {
        this.evt_caller = evt;
        ipc.once('sr-found', (evt, arg) => { this.evt_caller.reply('sr-fill', arg) } );
        Process.build('sr_search');
    },
    show_dialog: function(evt: Electron.IpcMainEvent, opt: DialogOptions) {
        this.evt_caller = evt;
        this.dialog_options = opt;
        ipc.once('get-dialog-options', (evt, arg) => { evt.returnValue = this.dialog_options });
        ipc.once('dialog-closed', (evt, arg) => { if (typeof(arg) === 'boolean') this.evt_caller.reply('dialog-reply', arg) });
        Process.build('dialog');
    },
    forgot_password: function(evt: Electron.IpcMainEvent) {
        Process.build('forgot_password');
    }
}

ipc.on('show-main', ElectronEvent.show_main)
    .on('show-worker-screen', ElectronEvent.show_worker_screen)
    .on('select-project', ElectronEvent.select_project)
    .on('sr-search', ElectronEvent.sr_search)
    .on('show-dialog', ElectronEvent.show_dialog)
    .on('forgot-password', ElectronEvent.forgot_password);