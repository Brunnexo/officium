// Electron
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

// Extensões internas
const { PageLoader, ColorMode, Charts, WorkerLabor, MSSQL } = require('../../officium-modules/Officium');

// Dependências
require('bootstrap');

// Instâncias
const HTML = new PageLoader();

// Variáveis globais
const worker = remote.getGlobal('data').worker;
const srs = remote.getGlobal('sql').srs;
const workTime = remote.getGlobal('parameters').workTime;

const charts = new Charts({
    title: 'title',
    historyTable: 'history-table',
    laborChart: 'labor-chart',
    totalChart: 'total-chart',
    extraChart: 'extra-chart',
    notification: 'notification-banner'
});

// Funções ao carregar a página

window.onload = () => {
    ColorMode(localStorage.getItem('colorMode'));
    LoadScripts();

    document.getElementById('nav-name').textContent = worker.Nome.value;
    document.getElementById("date").valueAsDate = new Date();

    HTML.load('personal-resume');

    let color = localStorage.getItem('colorMode');
    document.getElementById('colorMode')
        .getElementsByClassName('name')[0]
        .textContent = (color == 'light' ? 'Tema: claro' : color == 'dark' ? 'Tema: escuro' : 'Tema: auto.');

    remote.getCurrentWindow()
        .on('focus', () => {
            document.querySelector('.view').classList.remove('no-focus');
        })
        .on('blur', () => {
            document.querySelector('.view').classList.add('no-focus');
        });

    WorkerLabor.updateInfo({
        date: document.getElementById("date").value,
        registry: Number(worker.Registro.value),
        journey: worker.Jornada.value,
        workTime: workTime,
    }).onLoad = () => { charts.render(WorkerLabor.info) };

    WorkerLabor.getData();
}

ipc.on('confirm-labor', () => {
    // SQL_DRIVER.execute(WorkerLabor.toQuery());
    // setTimeout(() => {
    //     HTML.update(PageScripts);
    // }, 2000);
});

document.getElementById('date').onchange = () => {
    clearTimeout(this.inputDelay);
    this.inputDelay = setTimeout(() => {
        WorkerLabor.updateInfo({ date: document.getElementById("date").value });
        HTML.update();
    }, 500);
}

// Navegar para o resumo
document.getElementById('nav-resume').onclick = () => {
    document.querySelectorAll('.active').forEach((elmnt) => {
        elmnt.classList.remove('active');
    });
    document.getElementById('nav-resume').classList.add('active');
    HTML.load('personal-resume');
};

// Navegar para o registro
document.getElementById('nav-reg').onclick = () => {
    document.querySelectorAll('.active').forEach((elmnt) => {
        elmnt.classList.remove('active');
    });
    document.getElementById('nav-reg').classList.add('active');
    HTML.load('reg-type');
}

// Abrir preferências
document.getElementById('colorMode').onclick = () => {
    let color = localStorage.getItem('colorMode');
    let text = document.getElementById('colorMode').getElementsByClassName('name')[0];
    switch (color) {
        case 'light':
            ColorMode('dark');
            localStorage.setItem('colorMode', 'dark');
            text.textContent = 'Tema: escuro';
            break;
        case 'dark':
            ColorMode('auto');
            localStorage.setItem('colorMode', 'auto');
            text.textContent = 'Tema: auto.';
            break;
        case 'auto':
            ColorMode('light');
            localStorage.setItem('colorMode', 'light');
            text.textContent = 'Tema: claro';
            break;
    }
}

// Voltar ao início
document.getElementById('home').onclick = () => {
    ipc.send('back-main');
}

// Botões de janela
document.querySelectorAll('.close-btn')[0].onclick = () => {
    remote.getCurrentWindow().close()
};

function LoadScripts() {
    HTML.loadScript('personal-resume', () => {
        WorkerLabor.getData();
    });

    HTML.loadScript('reg-type', () => {
        document.getElementById('btn-sr').onclick = () => {
            HTML.load('reg-sr');
        }
        document.getElementById('btn-activities').onclick = () => {
            HTML.load('reg-activities');
        }
    });

    HTML.loadScript('reg-sr', () => {
        let inputwo = document.getElementById('input-wo'),
            inputsr = document.getElementById('input-sr'),
            inputservice = document.getElementById('input-service'),
            nextbutton = document.querySelectorAll('[btn-next]')[0],
            backbutton = document.querySelectorAll('[btn-back]')[0];

        backbutton.onclick = () => {
            HTML.load('reg-type');
        }

        nextbutton.onclick = () => {
            WorkerLabor.updateInfo({
                registry: worker.Registro.value,
                journey: worker.Jornada.value,
                function: `SR: ${inputsr.value}`,
                wo: inputwo.value,
                description: inputservice.value,
                date: document.getElementById("date").value,
                workTime: workTime
            });
            HTML.load('reg-sr-time');
        }

        inputwo.onkeyup = () => {
            clearTimeout(this.inputDelay);
            this.inputDelay = setTimeout(() => {
                let wo = Number(inputwo.value);
                if (!isNaN(wo) && wo !== 0) {
                    let wosearch = srs.filter((val) => { return val.WO.value == wo; })[0];
                    if (typeof(wosearch) !== 'undefined') {
                        inputsr.value = wosearch.SR.value;
                        inputservice.value = wosearch.Descrição.value;
                        nextbutton.style.display = 'unset';
                    } else {
                        inputsr.value = '';
                        inputservice.value = '';
                        nextbutton.style.display = 'none';
                    }
                } else {
                    inputsr.value = '';
                    inputservice.value = '';
                    nextbutton.style.display = 'none';
                }
            }, 500);
        };

        inputsr.onkeyup = () => {
            clearTimeout(this.inputDelay);
            this.inputDelay = setTimeout(() => {
                let sr = Number(inputsr.value);
                if (!isNaN(sr) && sr !== 0) {
                    let srsearch = srs.filter((val) => { return val.SR.value == sr; })[0];
                    if (typeof(srsearch) !== 'undefined') {
                        inputwo.value = srsearch.WO.value;
                        inputservice.value = srsearch.Descrição.value;
                        nextbutton.style.display = 'unset';
                    } else {
                        inputwo.value = '';
                        inputservice.value = '';
                        nextbutton.style.display = 'none';
                    }
                } else {
                    inputwo.value = '';
                    inputservice.value = '';
                    nextbutton.style.display = 'none';
                }
            }, 500);
        };
    });

    HTML.loadScript('reg-sr-time', () => {
        document.querySelectorAll('[btn-back]')[0]
            .onclick = () => {
                HTML.load('reg-sr', PageScripts);
            };

        document.getElementById('input-time').onkeyup = () => {
            let time = Number(document.getElementById('input-time').value);
            clearTimeout(this.inputDelay);
            this.inputDelay = setTimeout(() => {
                WorkerLabor.updateTime(time);
            }, 500);
        };

        document.getElementById('reg-btn').onclick = () => {
            ipc.send('show-confirm-dialog', WorkerLabor.toTable());
        }
    });
}