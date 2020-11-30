// Electron
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

// Extensões internas
const { PageLoader, ColorMode, RenderResume, RenderSR } = require('../../officium-modules/Officium');

// Dependências
window.jQuery = window.$ = require('jquery');
require('bootstrap');

// Instâncias
const HTML = new PageLoader();
// Variáveis remotas globais

const worker = remote.getGlobal('data').worker;
const srs = remote.getGlobal('sql').srs;
const workTime = remote.getGlobal('parameters').workTime;

const Resume = new RenderResume({
    title: 'title',
    registry: worker.Registro.value,
    journey: worker.Jornada.value,
    charts: {
        history: 'history',
        remain: 'graphRemain',
        total: 'graphTotal'
    },
    workTime: workTime
});

const SR = new RenderSR({
    registry: worker.Registro.value,
    journey: worker.Jornada.value,
    charts: {
        remain: 'graphRemain',
        extra: 'graphTotalExtra'
    },
    infos: {
        common: 'registered-common-time',
        extra: 'registered-extra-time'
    },
    workTime: workTime
});

// Funções ao carregar a página

window.onload = () => {
    // Esquema de cores
    ColorMode(localStorage.getItem('colorMode'));
    // Nome do colaborador
    document.getElementById('nav-name').textContent = worker.Nome.value;
    // Carrega data atual
    document.getElementById("date").valueAsDate = new Date();
    // Carrega inicialmente o resumo pessoal
    HTML.load('personal-resume', PageScripts);
    // Carrega o botão de cor
    let color = localStorage.getItem('colorMode');
    let text = document.getElementById('colorMode').getElementsByClassName('name')[0];

    switch (color) {
        case 'light':
            text.textContent = 'Tema: claro';
            break;
        case 'dark':
            text.textContent = 'Tema: escuro';
            break;
        case 'auto':
            text.textContent = 'Tema: auto.';
            break;
    }

    remote.getCurrentWindow()
        .on('focus', () => {
            document.querySelector('.view').classList.remove('no-focus');
        })
        .on('blur', () => {
            document.querySelector('.view').classList.add('no-focus');
        });
}

document.getElementById('date').onchange = () => {
    clearTimeout(this.inputDelay);
    this.inputDelay = setTimeout(() => {
        HTML.update(PageScripts);
    }, 500);
}

// Navegar para o resumo
document.getElementById('nav-resume').onclick = () => {
    document.querySelectorAll('.active').forEach((elmnt) => {
        elmnt.classList.remove('active');
    });
    document.getElementById('nav-resume').classList.add('active');
    HTML.load('personal-resume', PageScripts);
};

// Navegar para o registro
document.getElementById('nav-reg').onclick = () => {
    document.querySelectorAll('.active').forEach((elmnt) => {
        elmnt.classList.remove('active');
    });
    document.getElementById('nav-reg').classList.add('active');
    HTML.load('reg-type', PageScripts);
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


function PageScripts(pageId) {
    switch (pageId) {
        case 'personal-resume':
            Resume.getData(document.getElementById("date").value);
            break;
        case 'reg-type':
            document.getElementById('btn-sr').onclick = () => {
                HTML.load('reg-sr', PageScripts);
            }
            document.getElementById('btn-activities').onclick = () => {
                HTML.load('reg-activities', PageScripts);
            }
            break;
        case 'reg-sr':
            let inputwo = document.getElementById('input-wo'),
                inputsr = document.getElementById('input-sr'),
                inputservice = document.getElementById('input-service'),
                nextbutton = document.querySelector('[btn-next]').parentElement,
                backbutton = document.querySelector('[btn-back]').parentElement;

            backbutton.onclick = () => {
                HTML.load('reg-type', PageScripts);
            }

            nextbutton.onclick = () => {
                HTML.load('reg-sr-time', PageScripts);
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
                    }
                }, 500);
            };
            break;
        case 'reg-sr-time':
            SR.getData(document.getElementById('date').value, Number(document.getElementById('input-time').value));

            document.getElementById('input-time').onkeyup = () => {
                clearTimeout(this.inputDelay);
                this.inputDelay = setTimeout(() => {
                    SR.getData(document.getElementById('date').value, Number(document.getElementById('input-time').value));
                }, 500);
            }
            ipc.send('reg-work', { banana: 'potássio' });
            break;
    }
}