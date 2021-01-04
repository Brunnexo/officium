"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const fs = require("fs");
const main_1 = require("./main");
fs.readFile('./data/Parameters.json', 'utf-8', (err, data) => { global['parameters'] = JSON.parse(data); });
fs.readFile('./data/Activities.json', 'utf-8', (err, data) => { global['activities'] = JSON.parse(data); });
fs.readFile('./data/Clients.json', 'utf-8', (err, data) => { global['clients'] = JSON.parse(data); });
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
let labor_info, badge;
let worker_screen_evt;
let dialog_opt;
electron_1.ipcMain.on('show-main', (evt, arg) => {
    main_1.Process.build('main', () => { main_1.Process[arg].destroy(); });
});
electron_1.ipcMain.on('show-worker-screen', (evt, arg) => {
    main_1.Process.build('worker_screen', () => { main_1.Process[arg].destroy(); });
});
electron_1.ipcMain.on('select-project', (evt, arg) => {
    worker_screen_evt = evt;
    badge = arg.badge;
    labor_info = arg.info;
    main_1.Process.build('select_project');
});
electron_1.ipcMain.on('request-labor-info', evt => {
    evt.returnValue = labor_info;
});
electron_1.ipcMain.on('request-badge-name', evt => {
    evt.returnValue = badge;
});
electron_1.ipcMain.on('sr-search', (evt, arg) => {
    worker_screen_evt = evt;
    main_1.Process.build('sr_search');
});
electron_1.ipcMain.on('sr-found', (evt, arg) => {
    worker_screen_evt.reply('sr-fill', arg);
});
electron_1.ipcMain.on('project-selected', (evt, arg) => {
    worker_screen_evt.reply('reg-time', arg);
});
electron_1.ipcMain.on('show-dialog', (evt, arg) => {
    worker_screen_evt = evt;
    dialog_opt = arg;
    main_1.Process.build('dialog');
});
electron_1.ipcMain.on('dialog-closed', (evt, res) => {
    worker_screen_evt.reply('dialog-reply', res);
});
electron_1.ipcMain.on('get-dialog-options', (evt, arg) => {
    evt.returnValue = dialog_opt;
});
