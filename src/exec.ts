import { app, ipcMain as ipc } from 'electron';
import * as fs from 'fs';
import { Process } from './main';

const PARAMETERS = JSON.parse(fs.readFileSync('./data/Parameters.json', 'utf-8'));

global['sql'] = PARAMETERS.sql;
global['sql'].projects = {};
global['sql'].srs = {};
global['sql'].general = {};

global['data'] = {};
global['data'].worker = {};

app.on('ready', () => {Process.build('splash')});

ipc.on('show-main', () => {
    Process.build('main', () => { Process.splash.destroy() });
});

ipc.on('open-workerScreen', (evt, arg) => {
    if (arg != 'TRUE' && global['data'].worker['Funções'].value.split('').includes('A')) {
        evt.reply('adm-password-require');
    } else {
        Process.build('workerScreen', () => { Process.main.destroy})
    }
});