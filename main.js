const { app, BrowserWindow } = require('electron');
const ipc = require('electron').ipcMain;

let splash, mainWindow, workerScreen, admScreen;

// Variáveis globais
global.defs = {
    colaborador: {},
    projetos: {},
    srs: {},
    geral: {},
    feriados: {}
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

// Tela do colaborador
function buildWorkerScreen(ready) {
    workerScreen = new BrowserWindow({
        frame: false,
        width: 1280,
        height: 830,
        minWidth: 1280,
        minHeight: 830,
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

// Tela do administrativo
function buildAdmScreen(ready) {
    admScreen = new BrowserWindow({
        frame: false,
        width: 1280,
        height: 830,
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    admScreen.loadURL(`file://${__dirname}/app/build/admScreen.html`);
    admScreen.once('ready-to-show', () => {
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

// Abrir janela do colaborador 
ipc.on('open-workerScreen', () => {
    buildWorkerScreen(() => {
        workerScreen.show();
        mainWindow.destroy();
    });
});

// Abrir janela do administrativo
ipc.on('open-admScreen', () => {
    buildAdmScreen(() => {
        admScreen.show();
        mainWindow.destroy();
    })
});

// Voltar ao menu principal

// Da janela do colaborador
ipc.on('back-from-workerScreen', () => {
    buildMainWindow(() => {
        workerScreen.destroy();
        mainWindow.show();
    });
});

// Da janela do administrativo
ipc.on('back-from-admScreen', () => {
    buildMainWindow(() => {
        admScreen.destroy();
        mainWindow.show();
    });
});



// YmxpbWFwY29zdGFAZ21haWwuY29tJmhhc2g9MTQ3MTg4OTYw
//https://api.calendario.com.br/?ano=2017&estado=SP&cidade=SAO_PAULO&token=YmxpbWFwY29zdGFAZ21haWwuY29tJmhhc2g9MTQ3MTg4OTYw