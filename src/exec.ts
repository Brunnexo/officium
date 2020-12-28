import { app, ipcMain as ipc } from 'electron';
import * as fs from 'fs';
import { Process } from './main';

global['parameters'] = JSON.parse(fs.readFileSync('./data/Parameters.json', 'utf-8'));
global['activities'] = JSON.parse(fs.readFileSync('./data/Activities.json', 'utf-8'));
global['clients'] = JSON.parse(fs.readFileSync('./data/Clients.json', 'utf-8'));

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
    Process.build('main', () => { Process.worker_screen.destroy() })
});

var labor_info: any,
    badge: string;
var worker_screen_evt: Electron.IpcMainEvent;

ipc.on('show-confirm-dialog', (evt, arg) => {
    worker_screen_evt = evt;
    labor_info = arg;
    Process.build('confirm');
});

ipc.on('select-project', (evt, arg) => {
    worker_screen_evt = evt;
    badge = arg.badge;
    labor_info = arg.info;
    Process.build('select_project');
});

ipc.on('request-labor-info', evt => {
    evt.returnValue = labor_info;
});

ipc.on('request-badge-name', evt => {
    evt.returnValue = badge;
});

ipc.on('sr-search', (evt, arg) => {
    worker_screen_evt = evt;
    Process.build('sr_search');
});

ipc.on('show-resume', () => {
    worker_screen_evt.reply('show-resume');
});

ipc.on('sr-found', (evt, arg) => {
    worker_screen_evt.reply('sr-fill', arg);
});

ipc.on('project-selected', (evt, arg) => {
    worker_screen_evt.reply('reg-project-time', arg);
});

ipc.on('open-worker-screen', () => {
    Process.build('worker_screen', () => { Process.main.destroy() })
});