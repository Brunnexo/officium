import { app, ipcMain as ipc } from 'electron';
import * as fs from 'fs';
import { Process } from './main';

global['parameters'] = JSON.parse(fs.readFileSync('./data/Parameters.json', 'utf-8'));
global['sql'] = {
    projects: {},
    srs: {},
    general: {}
}

global['data'] = {};
global['data'].worker = {};

app.on('ready', () => {
    Process.build('splash');
});

ipc.on('show-main', () => {
    Process.build('main', () => { Process.splash.destroy() });
});

ipc.on('back-main', (evt, arg) => {
    Process.build('main', () => { Process.workerScreen.destroy() })
});

var tableData: any;
var workerScreenEvt: Electron.IpcMainEvent;

ipc.on('show-confirm-dialog', (evt, arg) => {
    workerScreenEvt = evt;
    tableData = arg;
    Process.build('confirmDialog');
})

ipc.on('confirm', () => {
    workerScreenEvt.reply('confirm-labor');
})


ipc.on('request-table-data', (evt) => {
    evt.returnValue = tableData;
})

ipc.on('open-workerScreen', (evt) => {
    Process.build('workerScreen', () => { Process.main.destroy() })
});