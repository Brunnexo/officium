import { app, ipcMain as ipc } from 'electron';
import * as fs from 'fs';
import { Process } from './main';


//global['parameters'] = JSON.parse(fs.readFileSync('./data/Parameters.json', 'utf-8'));
fs.readFile('./data/Parameters.json', 'utf-8', (err, data) => { global['parameters'] = JSON.parse(data) });
//global['activities'] = JSON.parse(fs.readFileSync('./data/Activities.json', 'utf-8'));
fs.readFile('./data/Activities.json', 'utf-8', (err, data) => { global['activities'] = JSON.parse(data) });
//global['clients'] = JSON.parse(fs.readFileSync('./data/Clients.json', 'utf-8'));
fs.readFile('./data/Clients.json', 'utf-8', (err, data) => { global['clients'] = JSON.parse(data) });

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

app.on('window-all-closed', () => {
    app.exit();
});

ipc.on('show-main', (evt, arg) => {
    Process.build('main', () => { Process[arg].destroy() });
});

ipc.on('show-worker-screen', (evt, arg) => {
    Process.build('worker_screen', () => { Process[arg].destroy() })
});

var labor_info: any,
    badge: string;
var worker_screen_evt: Electron.IpcMainEvent;

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

ipc.on('sr-found', (evt, arg) => {
    worker_screen_evt.reply('sr-fill', arg);
});

ipc.on('project-selected', (evt, arg) => {
    worker_screen_evt.reply('reg-project-time', arg);
});