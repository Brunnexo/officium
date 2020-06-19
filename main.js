const { app, BrowserWindow } = require('electron');
const ipc = require('electron').ipcMain;

let splash;
let mainWindow;
let workerScreen;

// Variáveis globais
global.defs = {
    colaborador: {},
    projetos: {},
    srs: {}
};

// Tela de carregando (splash)
function buildSplash(ready) {
    splash = new BrowserWindow({
        show: false,
        frame: false,
        width: 300,
        height: 300,
        resizable: false,
        closable: false,
        skipTaskbar: true,
        webPreferences: {
            nodeIntegration: true,
        }
    });
    splash.loadURL(`file://${__dirname}/app/build/splash.html`);
    splash.once('ready-to-show', () => {
        ready();
    });
}

// Tela principal
function buildMainWindow(ready) {
    mainWindow = new BrowserWindow({
        width: 720,
        height: 391,
        show: false,
        frame: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
        }
    });
    mainWindow.loadURL(`file://${__dirname}/app/build/mainWindow.html`);
    mainWindow.once('ready-to-show', () => {
        ready();
    });
}

function buildWorkerScreen(ready) {
    workerScreen = new BrowserWindow({
        frame: false,
        minWidth: 1280,
        width: 1280,
        minHeight: 720,
        height: 720,
        show: false,
        // fullscreen: true,
        webPreferences: {
            nodeIntegration: true
        }
    });
    workerScreen.loadURL(`file://${__dirname}/app/build/workerScreen.html`);
    workerScreen.once('ready-to-show', () => {
        // workerScreen.setFullScreen(true);
        ready();
    })
}

app.on('ready', function() {
    buildSplash(() => {
        splash.show();
    });
});

app.on('window-all-closed', function() {
    app.quit();
});

// Processos Inter-Comunicados

// Abrir janela do colaborador
ipc.on('ready', () => {
    buildMainWindow(() => {
        setTimeout(() => {
            splash.destroy();
            mainWindow.show();
        }, 1000);
    });
});

ipc.on('open-workerScreen', () => {
    buildWorkerScreen(() => {
        workerScreen.show();
        mainWindow.destroy();
    });
});

// Voltar ao menu principal
ipc.on('back-from-workerScreen', () => {
    buildMainWindow(() => {
        workerScreen.destroy();
        mainWindow.show();
    });
});