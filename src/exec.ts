import { app, ipcMain as ipc } from 'electron';
import * as fs from 'fs';
import { Process } from './main';

global['parameters'] = JSON.parse(fs.readFileSync('./data/Parameters.json', 'utf-8'));
global['activities'] = JSON.parse(fs.readFileSync('./data/Activities.json', 'utf-8'));

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
});

ipc.on('show-main', () => {
    Process.build('main', () => { Process.splash.destroy() });
});

ipc.on('back-main', () => {
    Process.build('main', () => { Process.workerScreen.destroy() })
});

var laborInfo: any;
var workerScreenEvt: Electron.IpcMainEvent;

ipc.on('show-confirm-dialog', (evt, arg) => {
    workerScreenEvt = evt;
    laborInfo = arg;
    Process.build('confirmDialog');
})
ipc.on('sr-search', (evt, arg) => {
    workerScreenEvt = evt;
    Process.build('srSearchDialog');
})
ipc.on('show-resume', () => {
    workerScreenEvt.reply('show-resume');
})
ipc.on('sr-found', (evt, arg) => {
    workerScreenEvt.reply('sr-fill', arg);
})

ipc.on('request-labor-info', (evt) => {
    evt.returnValue = laborInfo;
})

ipc.on('open-workerScreen', () => {
    Process.build('workerScreen', () => { Process.main.destroy() })
});