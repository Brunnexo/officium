"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const datas_1 = require("./datas");
const main_1 = require("./main");
global['parameters'] = datas_1.parameters;
global['activities'] = datas_1.activities;
global['clients'] = datas_1.clients;
global['sql'] = {
    department: {},
    projects: {},
    srs: {},
    general: {}
};
global['data'] = {};
global['data'].worker = {};
electron_1.app.on('ready', () => {
    main_1.Process.build('splash');
});
electron_1.app.on('window-all-closed', () => {
    electron_1.app.exit();
});
const ElectronEvent = {
    show_main: function (evt, arg) {
        main_1.Process.build('main', () => { main_1.Process[arg].destroy(); });
    },
    show_worker_screen: function (evt, arg) {
        main_1.Process.build('worker_screen', () => { main_1.Process[arg].destroy(); });
    },
    select_project: function (evt, arg) {
        this.evt_caller = evt;
        this.badge = arg.badge;
        this.info = arg.info;
        main_1.Process.build('select_project');
        electron_1.ipcMain.once('request-labor-info', evt => evt.returnValue = this.info);
        electron_1.ipcMain.once('request-badge-name', evt => evt.returnValue = this.badge);
        electron_1.ipcMain.once('project-selected', (evt, arg) => { this.evt_caller.reply('reg-time', arg); });
    },
    sr_search: function (evt) {
        this.evt_caller = evt;
        electron_1.ipcMain.once('sr-found', (evt, arg) => { this.evt_caller.reply('sr-fill', arg); });
        main_1.Process.build('sr_search');
    },
    show_dialog: function (evt, opt) {
        this.evt_caller = evt;
        this.dialog_options = opt;
        electron_1.ipcMain.once('get-dialog-options', (evt, arg) => { evt.returnValue = this.dialog_options; });
        electron_1.ipcMain.once('dialog-closed', (evt, arg) => { if (typeof (arg) === 'boolean')
            this.evt_caller.reply('dialog-reply', arg); });
        main_1.Process.build('dialog');
    },
    forgot_password: function (evt) {
        main_1.Process.build('forgot_password');
    }
};
electron_1.ipcMain.on('show-main', ElectronEvent.show_main)
    .on('show-worker-screen', ElectronEvent.show_worker_screen)
    .on('select-project', ElectronEvent.select_project)
    .on('sr-search', ElectronEvent.sr_search)
    .on('show-dialog', ElectronEvent.show_dialog)
    .on('forgot-password', ElectronEvent.forgot_password);
