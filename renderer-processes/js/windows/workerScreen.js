// Electron
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

// Extensões internas
const { PageLoader, ColorMode, Charts, WorkerLabor, MSSQL } = require('../../../officium-modules/Officium');

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
});

// Funções ao carregar a página
window.onload = () => {
    ColorMode(localStorage.getItem('colorMode'));
    LoadScripts();
    document.getElementById('nav-name').textContent = worker.Nome.value;
    document.getElementById("date").valueAsDate = new Date();

    let color = localStorage.getItem('colorMode');
    document.getElementById('colorMode')
        .getElementsByClassName('name')[0]
        .textContent = (color == 'light' ? 'Tema: claro' : color == 'dark' ? 'Tema: escuro' : 'Tema: auto.');

    document.body.onmouseover = function(ev) {
        ev.preventDefault();
        let windowSize = remote.getCurrentWindow().getBounds();
        let w = {
            width: windowSize.width,
            height: windowSize.height
        };
        let c = {
            x: ev.clientX,
            y: ev.clientY
        };

        const border = 25;

        if (((c.x >= 0 && c.x <= border) && (c.y >= 0 && c.y <= border)) ||
            ((c.x >= (w.width - border)) && (c.y >= (w.height - border))))
            document.body.classList.add('corner');
        else document.body.classList.remove('corner');
    }

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

    HTML.load('personal-resume');
}

ipc.on('show-resume', () => {
    document.querySelectorAll('.active').forEach((elmnt) => {
        elmnt.classList.remove('active');
    });
    document.getElementById('nav-resume').classList.add('active');
    HTML.load('personal-resume');
})

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
        charts.updateInfo({
            title: 'title',
            historyTable: 'history-table',
            laborChart: 'labor-chart',
            totalChart: 'total-chart',
            extraChart: 'extra-chart',
        });
        WorkerLabor.getData();
    });

    HTML.loadScript('reg-type', () => {
        WorkerLabor.clear();

        document.getElementById('btn-sr').onclick = () => {
            HTML.load('reg-sr');
        }
        document.getElementById('btn-activities').onclick = () => {
            HTML.load('reg-function');
        }
    });

    HTML.loadScript('reg-function', () => {
        let nextbutton = document.querySelectorAll('[btn-next]')[0],
            backbutton = document.querySelectorAll('[btn-back]')[0];

        let list_functions = document.getElementById('list-functions');

        const functions = {
            "E": "Eletricista",
            "M": "Mecânico",
            "P": "Programador",
            "R": "Projetista",
            "A": "Administrativo",
            "N": "Engenheiro"
        };

        worker['Funções'].value.split('').forEach(s => {
            if (s != ' ') {
                let option = document.createElement('option');
                option.value = s;
                option.innerHTML = `${functions[s]}`
                list_functions.appendChild(option);
            }
        });

        backbutton.onclick = () => { HTML.load('reg-type') };
        nextbutton.onclick = () => {
            WorkerLabor.updateInfo({ function: functions[list_functions.selectedOptions[0].value] });
            HTML.load('reg-activity');
        };
    });

    HTML.loadScript('reg-activity', () => {
        let department = remote.getGlobal('sql').department;

        let list_activities = document.getElementById('list-activities'),
            list_descriptions = document.getElementById('list-descriptions');

        let nextbutton = document.querySelectorAll('[btn-next]')[0],
            backbutton = document.querySelectorAll('[btn-back]')[0];

        let worker_function = WorkerLabor.info.function;

        let function_activities = remote.getGlobal('activities')['Activities'][worker_function];

        Object.keys(function_activities).forEach(d => {
            let option = document.createElement('option');
            option.setAttribute('project', function_activities[d]['Project']);
            option.setAttribute('wo-each', function_activities[d]['WO each']);
            option.setAttribute('wo-as', function_activities[d]['WO as']);
            option.innerHTML = `${d}`;
            list_activities.appendChild(option);
        });

        list_activities.onchange = () => {
            let activity = list_activities.selectedOptions[0].value;
            list_descriptions.innerHTML = '';
            function_activities[activity]['Descriptions'].forEach(e => {
                let option = document.createElement('option');
                option.innerHTML = e;
                list_descriptions.appendChild(option);
            });
        };

        list_activities.onchange();

        backbutton.onclick = () => { HTML.load('reg-function') };
        nextbutton.onclick = () => {
            if (eval(list_activities.selectedOptions[0].getAttribute('project'))) {


            } else {
                if (eval(list_activities.selectedOptions[0].getAttribute('wo-each'))) {

                } else {
                    let wo_description = list_activities.selectedOptions[0].getAttribute('wo-as');



                }

            }
        };
    });

    HTML.loadScript('reg-sr', () => {
        let inputwo = document.getElementById('input-wo'),
            inputsr = document.getElementById('input-sr'),
            inputservice = document.getElementById('input-service'),
            searchbutton = document.getElementById('btn-service-search'),
            nextbutton = document.querySelectorAll('[btn-next]')[0],
            backbutton = document.querySelectorAll('[btn-back]')[0];

        backbutton.onclick = () => { HTML.load('reg-type') };

        searchbutton.onclick = () => { ipc.send('sr-search') };

        ipc.on('sr-fill', (evt, arg) => {
            inputwo.value = arg.wo;
            inputsr.value = arg.sr;
            inputservice.value = arg.description;
            nextbutton.removeAttribute('disabled');
        });

        nextbutton.onclick = () => {
            WorkerLabor.updateInfo({
                function: `SR ${inputsr.value}`,
                wo: inputwo.value,
                description: inputservice.value,
                date: document.getElementById("date").value,
                workTime: workTime
            });
            HTML.load('reg-time');
        }

        inputwo.onkeyup = wo_changed;

        function wo_changed() {
            nextbutton.setAttribute('disabled', '');
            clearTimeout(this.inputDelay);
            this.inputDelay = setTimeout(() => {
                let wo = Number(inputwo.value);
                if (!isNaN(wo) && wo !== 0) {
                    let wosearch = srs.filter((val) => { return val.WO.value == wo; })[0];
                    if (typeof(wosearch) !== 'undefined') {
                        inputsr.value = wosearch.SR.value;
                        inputservice.value = wosearch.Descrição.value;
                        nextbutton.removeAttribute('disabled');
                    } else {
                        inputsr.value = '';
                        inputservice.value = '';
                        nextbutton.setAttribute('disabled', '');
                    }
                } else {
                    inputsr.value = '';
                    inputservice.value = '';
                    nextbutton.setAttribute('disabled', '');
                }
            }, 500);
        }

        inputsr.onkeyup = sr_changed;

        function sr_changed() {
            nextbutton.setAttribute('disabled', '');
            clearTimeout(this.inputDelay);
            this.inputDelay = setTimeout(() => {
                let sr = Number(inputsr.value);
                if (!isNaN(sr) && sr !== 0) {
                    let srsearch = srs.filter((val) => { return val.SR.value == sr; })[0];
                    if (typeof(srsearch) !== 'undefined') {
                        inputwo.value = srsearch.WO.value;
                        inputservice.value = srsearch.Descrição.value;
                        if (srsearch.WO.value !== '') nextbutton.removeAttribute('disabled');
                    } else {
                        inputwo.value = '';
                        inputservice.value = '';
                        nextbutton.setAttribute('disabled', '');
                    }
                } else {
                    inputwo.value = '';
                    inputservice.value = '';
                    nextbutton.setAttribute('disabled', '');
                }
            }, 500);
        }

        inputwo.value = (typeof(WorkerLabor.info.wo) === 'undefined' ? '' : WorkerLabor.info.wo);
        wo_changed();
    });

    HTML.loadScript('reg-time', () => {
        WorkerLabor.getData();

        document.querySelectorAll('[btn-back]')[0]
            .onclick = () => {
                HTML.load('reg-sr');
            };

        document.getElementById('input-time').onkeyup = () => {
            let time = Number(document.getElementById('input-time').value);
            let btn = document.getElementById('reg-btn');

            btn.setAttribute('disabled', '');

            clearTimeout(this.inputDelay);
            this.inputDelay = setTimeout(() => {
                if (!WorkerLabor.inputTime(time)) btn.setAttribute('disabled', '');
                else btn.removeAttribute('disabled');
                charts.render(WorkerLabor.info);
            }, 500);
        };

        document.getElementById('reg-btn').onclick = () => {
            ipc.send('show-confirm-dialog', WorkerLabor.getLabor());
        }
    });
}