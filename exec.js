"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// import { activities, parameters, clients } from './datas';
const fs = require("fs");
const path = require("path");
const main_1 = require("./main");
fs.readFile(path.resolve(__dirname, 'officium-modules/data/Activities.json'), (err, data) => { global['activities'] = JSON.parse(data); });
fs.readFile(path.resolve(__dirname, 'officium-modules/data/Clients.json'), (err, data) => { global['clients'] = JSON.parse(data); });
fs.readFile(path.resolve(__dirname, 'officium-modules/data/Parameters.json'), (err, data) => { global['parameters'] = JSON.parse(data); });
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
}).on('window-all-closed', () => {
    electron_1.app.exit();
});
const ElectronEvent = {
    show_main: function (evt, arg) {
        main_1.Process.build('main', () => { main_1.Process[arg].destroy(); })
            .on('closed', () => {
            electron_1.ipcMain.once('show-main', ElectronEvent.show_main);
        });
    },
    show_worker_screen: function (evt, arg) {
        main_1.Process.build('worker_screen', () => { main_1.Process[arg].destroy(); })
            .on('closed', () => {
            electron_1.ipcMain.once('show-worker-screen', ElectronEvent.show_worker_screen);
        });
    },
    select_project: function (evt, arg) {
        this.evt_caller = evt;
        this.badge = arg.badge;
        this.info = arg.info;
        main_1.Process.build('select_project')
            .on('closed', () => {
            electron_1.ipcMain.once('select-project', ElectronEvent.select_project);
        });
        electron_1.ipcMain.once('request-labor-info', evt => evt.returnValue = this.info);
        electron_1.ipcMain.once('request-badge-name', evt => evt.returnValue = this.badge);
        electron_1.ipcMain.once('project-selected', (evt, arg) => { this.evt_caller.reply('reg-time', arg); });
    },
    sr_search: function (evt) {
        this.evt_caller = evt;
        electron_1.ipcMain.once('sr-found', (evt, arg) => { this.evt_caller.reply('sr-fill', arg); });
        main_1.Process.build('sr_search')
            .on('closed', () => {
            electron_1.ipcMain.once('sr-search', ElectronEvent.sr_search);
        });
    },
    show_dialog: function (evt, opt) {
        this.evt_caller = evt;
        this.dialog_options = opt;
        electron_1.ipcMain.once('get-dialog-options', (evt, arg) => { evt.returnValue = this.dialog_options; });
        electron_1.ipcMain.once('dialog-closed', (evt, arg) => { if (typeof (arg) === 'boolean')
            this.evt_caller.reply('dialog-reply', arg); });
        main_1.Process.build('dialog')
            .on('closed', () => {
            electron_1.ipcMain.once('show-dialog', ElectronEvent.show_dialog);
        });
    },
    forgot_password: function (evt) {
        main_1.Process.build('forgot_password')
            .on('closed', () => {
            electron_1.ipcMain.once('forgot-password', ElectronEvent.forgot_password);
        });
    },
    show_report: function (evt) {
        main_1.Process.build('report')
            .on('closed', () => {
            electron_1.ipcMain.once('show-report', ElectronEvent.show_report);
        });
    }
};
electron_1.ipcMain.once('show-main', ElectronEvent.show_main)
    .once('show-worker-screen', ElectronEvent.show_worker_screen)
    .once('select-project', ElectronEvent.select_project)
    .once('sr-search', ElectronEvent.sr_search)
    .once('show-dialog', ElectronEvent.show_dialog)
    .once('forgot-password', ElectronEvent.forgot_password)
    .once('show-report', ElectronEvent.show_report);
