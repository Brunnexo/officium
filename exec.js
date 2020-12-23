"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const fs = require("fs");
const main_1 = require("./main");
global['parameters'] = JSON.parse(fs.readFileSync('./data/Parameters.json', 'utf-8'));
global['activities'] = JSON.parse(fs.readFileSync('./data/Activities.json', 'utf-8'));
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
    main_1.Process.build('main', () => { main_1.Process.workerScreen.destroy(); });
});
var laborInfo;
var workerScreenEvt;
electron_1.ipcMain.on('show-confirm-dialog', (evt, arg) => {
    workerScreenEvt = evt;
    laborInfo = arg;
    main_1.Process.build('confirmDialog');
});
electron_1.ipcMain.on('sr-search', (evt, arg) => {
    workerScreenEvt = evt;
    main_1.Process.build('srSearchDialog');
});
electron_1.ipcMain.on('show-resume', () => {
    workerScreenEvt.reply('show-resume');
});
electron_1.ipcMain.on('sr-found', (evt, arg) => {
    workerScreenEvt.reply('sr-fill', arg);
});
electron_1.ipcMain.on('request-labor-info', (evt) => {
    evt.returnValue = laborInfo;
});
electron_1.ipcMain.on('open-workerScreen', () => {
    main_1.Process.build('workerScreen', () => { main_1.Process.main.destroy(); });
});
