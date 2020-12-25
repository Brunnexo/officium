"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const fs = require("fs");
const main_1 = require("./main");
global['parameters'] = JSON.parse(fs.readFileSync('./data/Parameters.json', 'utf-8'));
global['activities'] = JSON.parse(fs.readFileSync('./data/Activities.json', 'utf-8'));
global['clients'] = JSON.parse(fs.readFileSync('./data/Clients.json', 'utf-8'));
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
electron_1.ipcMain.on('show-main', () => {
    main_1.Process.build('main', () => { main_1.Process.splash.destroy(); });
});
electron_1.ipcMain.on('back-main', () => {
    main_1.Process.build('main', () => { main_1.Process.worker_screen.destroy(); });
});
var labor_info;
var worker_screen_evt;
electron_1.ipcMain.on('show-confirm-dialog', (evt, arg) => {
    worker_screen_evt = evt;
    labor_info = arg;
    main_1.Process.build('confirm');
});
electron_1.ipcMain.on('sr-search', (evt, arg) => {
    worker_screen_evt = evt;
    main_1.Process.build('sr_search');
});
electron_1.ipcMain.on('show-resume', () => {
    worker_screen_evt.reply('show-resume');
});
electron_1.ipcMain.on('sr-found', (evt, arg) => {
    worker_screen_evt.reply('sr-fill', arg);
});
electron_1.ipcMain.on('request-labor-info', (evt) => {
    evt.returnValue = labor_info;
});
electron_1.ipcMain.on('open-worker-screen', () => {
    main_1.Process.build('worker_screen', () => { main_1.Process.main.destroy(); });
});
