const { app, BrowserWindow } = require('electron');
const ipc = require('electron').ipcMain;

var main, splash, workerScreen;
var admScreen = false;

global = {
    sql: {
        projects: {},
        srs: {},
        general: {},
        config: {
            server: '127.0.0.1',
            authentication: {
                type: 'default',
                options: {
                    userName: 'SAT_LOGON',
                    password: 'pAcMaN2@'
                }
            },
            options: {
                encrypt: false,
                database: 'SAT',
                enableArithAbort: true,
                appName: 'SAT',
                useColumnNames: true
            }
        }
    },
    settings: {
        times: {
            hourly: 528,
            monthly: 522
        },
        extras: {
            hourly: 60,
            monthly: Infinity
        }
    },
    data: {
        worker: {

        },
        clients: [
            "GM", "VW", "FORD", "FCA", "RENAULT",
            "HONDA", "NISSAN", "TOYOTA", "HYUNDAI",
            "MERCEDES", "PSA", "MAN"
        ],
        activities: {
            "Administrativo": {
                "Controle": [
                    "Controle de Compras",
                    "Controle de Demanda",
                    "Controle de Horas"
                ],
                "Documentação": [
                    "Documentação de Máquina",
                    "Documentação Geral",
                    "Projeto",
                ],
                "Orçamento e Gestão": [
                    "Orçamento",
                    "Gestão de Projeto",
                    "Follow Up e Demanda"
                ]
            },
            "Eletricista": {
                "Montagem": [
                    "Montagem de Painel Elétrico",
                    "Montagem de Máquina",
                    "Montagem Geral"
                ],
                "Testes": [
                    "Testes de Sensores",
                    "Testes de Dispositivos",
                    "Testes de Funcionamento da Célula"
                ],
                "Identificação": [
                    "Identificação de Máquinas",
                    "Identificação de Painel Elétrico"
                ],
                "Documentos": [
                    "Esquema Elétrico",
                    "Lista de Peças",
                    "Documentação"
                ],
                "Orçamento": [
                    "Orçamento"
                ],
                "Gestão e Acompanhamento": [
                    "Gestão de Projeto",
                    "Acompanhamento de S.A.",
                    "Acompanhamento de Produção",
                    "Acompanhamento de Fornecedor",
                    "Acompanhamento de Evento",
                    "Acompanhamento de Montagem"
                ]
            },
            "Mecânico": {
                "Montagem": [
                    "Montagem Geral",
                    "Montagem de Sistema Pneumático",
                    "Montagem de Componentes"
                ],
                "Usinagem": [
                    "Fresadora",
                    "Torno",
                    "Furadeira",
                    "Geral"
                ],
                "Ajustes": [
                    "Ajuste de Posição de Peça",
                    "Calibração",
                    "Alinhamento"
                ],
                "Caldeiraria": [
                    "Chapas",
                    "Corte",
                    "Dobra",
                    "Solda",
                    "Traçagem"
                ],
                "Documentação": [
                    "Documentação Geral",
                    "Lista de Materiais"
                ],
                "Orçamento": [
                    "Orçamento de Máquina",
                    "Lista de Materiais"
                ],
                "Gestão de Projeto": [
                    "Gestão de Projeto"
                ]
            },
            "Programador": {
                "Programação": [
                    "Desenvolvimento",
                    "Programação",
                    "Ajustes",
                    "Correções",
                    "Backup"
                ],
                "Projeto Elétrico": [
                    "Desenvolvimento de Projeto",
                    "Correção"
                ],
                "Documentação": [
                    "Documentação Geral"
                ],
                "Orçamento": [
                    "Orçamento"
                ],
                "Gestão de Projeto": [
                    "Gestão de Projeto"
                ]
            },
            "Projetista": {
                "Desenvolvimento": [
                    "Desenvolvimento de Projeto",
                    "Controle de Projeto",
                    "Lista de Peças",
                    "Design Review"
                ],
                "Visita Técnica": [
                    "Forneçedor",
                    "Cliente"
                ],
                "Elaboração": [
                    "Termo de Abertura",
                    "Escopo"
                ],
                "Gestão e Acompanhamento": [
                    "Follow Up e Demanda",
                    "Gestão de Projeto",
                    "Acompanhamento de S.A.",
                    "Acompanhamento de Produção",
                    "Acompanhamento de Fornecedor",
                    "Acompanhamento de Evento",
                    "Acompanhamento de Montagem"
                ],
                "Documentação": [
                    "Documentação de Máquina",
                    "Documentação Geral",
                    "Orçamento"
                ]
            },
            "Engenheiro": {
                "Desenvolvimento": [
                    "Desenvolvimento de Projeto",
                    "Controle de Projeto",
                    "Lista de Peças",
                    "Design Review"
                ],
                "Visita Técnica": [
                    "Forneçedor",
                    "Cliente"
                ],
                "Elaboração": [
                    "Termo de Abertura",
                    "Escopo"
                ],
                "Gestão e Acompanhamento": [
                    "Follow Up e Demanda",
                    "Gestão de Projeto",
                    "Acompanhamento de S.A.",
                    "Acompanhamento de Produção",
                    "Acompanhamento de Fornecedor",
                    "Acompanhamento de Evento",
                    "Acompanhamento de Montagem"
                ],
                "Documentação": [
                    "Documentação de Máquina",
                    "Documentação Geral",
                    "Orçamento"
                ]
            },
        },
        generalActivities: {
            "Retrabalhos e Melhorias": [
                "Retrabalho Interno",
                "Retrabalho Externo",
                "Melhorias"
            ],
            "Geral": [
                "Testes e Protótipos",
                "Manutenção",
                "Almoxarifado",
                "5S",
                "Não Produtivos",
                "Ausência"
            ]
        }
    }
};
// Execução
app.on('ready', () => {
    buildSplash(() => {
        splash.show();
    });
});
// Comunicação entre processos
ipc.on('show-main', () => {
    buildMain(() => {
        setTimeout(() => {
            main.show();
            splash.destroy();
        }, 2000);
    });
});
// Abrir janela do colaborador
ipc.on('open-workerScreen', (evt, arg) => {
    if (arg != 'TRUE' && global.data.worker['Funções'].value.split('').includes('A')) {
        evt.reply('adm-password-require');
    } else if (arg == 'TRUE') {
        admScreen = true;
        buildWorkerScreen(() => {
            workerScreen.show();
            main.destroy();
        });
    } else {
        admScreen = false;
        buildWorkerScreen(() => {
            workerScreen.show();
            main.destroy();
        });
    }
});
// Volta pra tela principal
ipc.on('back-to-main', (evt, arg) => {
    buildMain(() => {
        main.show();
        workerScreen.destroy();
    });
});
// Requisita funções administrativas
ipc.on('adm-request', (evt, arg) => {
    evt.reply('adm-worker', admScreen);
});
// Construtores de janela
// Splash
function buildSplash(ready) {
    splash = new BrowserWindow({
        "show": false,
        "frame": false,
        "width": 300,
        "height": 300,
        "resizable": false,
        "closable": false,
        "skipTaskbar": true,
        "webPreferences": {
            "nodeIntegration": true,
            "enableRemoteModule": true
        }
    });
    splash.loadURL(`${__dirname}/renderer-processes/html/splash.html`);
    splash.once('ready-to-show', () => {
        ready()
    });
};
// Main
function buildMain(ready) {
    main = new BrowserWindow({
        "show": false,
        "frame": false,
        "width": 500,
        "height": 500,
        "resizable": false,
        "webPreferences": {
            "nodeIntegration": true,
            "enableRemoteModule": true
        }
    });
    main.loadURL(`${__dirname}/renderer-processes/html/main.html`);
    main.once('ready-to-show', () => {
        ready();
    });
}
// WorkerScreen
function buildWorkerScreen(ready) {
    workerScreen = new BrowserWindow({
        "show": false,
        "frame": false,
        "width": 1280,
        "height": 830,
        "minWidth": 1280,
        "minHeight": 830,
        "webPreferences": {
            "nodeIntegration": true,
            "enableRemoteModule": true
        }
    });
    workerScreen.loadURL(`${__dirname}/renderer-processes/html/workerScreen.html`);
    workerScreen.once('ready-to-show', () => {
        ready();
    });
}