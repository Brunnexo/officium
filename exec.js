"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const fs = require("fs");
const main_1 = require("./main");
//global['parameters'] = JSON.parse(fs.readFileSync('./data/Parameters.json', 'utf-8'));
fs.readFile('./data/Parameters.json', 'utf-8', (err, data) => { global['parameters'] = JSON.parse(data); });
//global['activities'] = JSON.parse(fs.readFileSync('./data/Activities.json', 'utf-8'));
fs.readFile('./data/Activities.json', 'utf-8', (err, data) => { global['activities'] = JSON.parse(data); });
//global['clients'] = JSON.parse(fs.readFileSync('./data/Clients.json', 'utf-8'));
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
electron_1.ipcMain.on('show-main', (evt, arg) => {
    main_1.Process.build('main', () => { main_1.Process[arg].destroy(); });
});
electron_1.ipcMain.on('show-worker-screen', (evt, arg) => {
    main_1.Process.build('worker_screen', () => { main_1.Process[arg].destroy(); });
});
var labor_info, badge;
var worker_screen_evt;
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
    worker_screen_evt.reply('reg-project-time', arg);
});
