import { app, ipcMain as ipc } from 'electron';
// import { activities, parameters, clients } from './datas';
import * as fs from 'fs';
import * as path from 'path';
import { Process } from './main';

fs.readFile(path.resolve(__dirname, 'officium-modules/data/Activities.json'), (err, data: any) => {global['activities'] = JSON.parse(data)});
fs.readFile(path.resolve(__dirname, 'officium-modules/data/Clients.json'), (err, data: any) => {global['clients'] = JSON.parse(data)});
fs.readFile(path.resolve(__dirname, 'officium-modules/data/Parameters.json'), (err, data: any) => {global['parameters'] = JSON.parse(data)});

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
}).on('window-all-closed', () => {
    app.exit();
});

interface DialogOptions {
    title: string,
    type: 'yes-no' | 'info',
    content: string
}

const ElectronEvent = {
    show_main: function(evt: Electron.IpcMainEvent, arg: string) {
        Process.build('main', () => { Process[arg].destroy() })
            .on('closed', () => {
                ipc.once('show-main', ElectronEvent.show_main);
            })
    },
    show_worker_screen: function(evt: Electron.IpcMainEvent, arg: string) {
        Process.build('worker_screen', () => { Process[arg].destroy() })
            .on('closed', () => {
                ipc.once('show-worker-screen', ElectronEvent.show_worker_screen)
            });
    },
    select_project: function(evt: Electron.IpcMainEvent, arg: { badge: string; info: any; }) {
        this.evt_caller = evt;
        this.badge = arg.badge;
        this.info = arg.info;
        
        Process.build('select_project')
            .on('closed', () => {
                ipc.once('select-project', ElectronEvent.select_project);
            });

        ipc.once('request-labor-info', evt => evt.returnValue = this.info);
        ipc.once('request-badge-name', evt => evt.returnValue = this.badge);
        ipc.once('project-selected', (evt, arg) => { this.evt_caller.reply('reg-time', arg) } );
    },
    sr_search: function(evt: Electron.IpcMainEvent) {
        this.evt_caller = evt;
        ipc.once('sr-found', (evt, arg) => { this.evt_caller.reply('sr-fill', arg) } );
        Process.build('sr_search')
            .on('closed', () => {
                ipc.once('sr-search', ElectronEvent.sr_search);
            });
    },
    show_dialog: function(evt: Electron.IpcMainEvent, opt: DialogOptions) {
        this.evt_caller = evt;
        this.dialog_options = opt;
        ipc.once('get-dialog-options', (evt, arg) => { evt.returnValue = this.dialog_options });
        ipc.once('dialog-closed', (evt, arg) => { if (typeof(arg) === 'boolean') this.evt_caller.reply('dialog-reply', arg) });
        Process.build('dialog')
            .on('closed', () => {
                ipc.once('show-dialog', ElectronEvent.show_dialog);
            });
    },
    forgot_password: function(evt: Electron.IpcMainEvent) {
        Process.build('forgot_password')
            .on('closed', () => {
                ipc.once('forgot-password', ElectronEvent.forgot_password);
            });
    },
    show_report: function(evt: Electron.IpcMainEvent) {
        Process.build('report')
            .on('closed', () => {
                ipc.once('show-report', ElectronEvent.show_report);
            });
    }
}

ipc.once('show-main', ElectronEvent.show_main)
    .once('show-worker-screen', ElectronEvent.show_worker_screen)
    .once('select-project', ElectronEvent.select_project)
    .once('sr-search', ElectronEvent.sr_search)
    .once('show-dialog', ElectronEvent.show_dialog)
    .once('forgot-password', ElectronEvent.forgot_password)
    .once('show-report', ElectronEvent.show_report);