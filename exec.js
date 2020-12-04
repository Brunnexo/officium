"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./main");
const electron_1 = require("electron");
const fs = require("fs");
const PARAMETERS = JSON.parse(fs.readFileSync('./data/Parameters.json', 'utf-8'));
global['sql'] = PARAMETERS.sql;
global['sql'].projects = {};
global['sql'].srs = {};
global['sql'].general = {};
global['data'] = {};
global['data'].worker = {};
electron_1.app.on('ready', () => { main_1.Process.build('splash'); });
electron_1.ipcMain.on('show-main', () => {
    main_1.Process.build('main', () => { main_1.Process.splash.destroy(); });
});
electron_1.ipcMain.on('open-workerScreen', (evt, arg) => {
    if (arg != 'TRUE' && global['data'].worker['Funções'].value.split('').includes('A')) {
        evt.reply('adm-password-require');
    }
    else {
        main_1.Process.build('workerScreen', () => { main_1.Process.main.destroy; });
    }
});
