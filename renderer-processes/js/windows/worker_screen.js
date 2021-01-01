// Electron
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

// Extensões internas
const { PageLoader, ColorMode, Charts, WorkerLabor, WorkerManager } = require('../../../officium-modules/Officium');

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

const functions = {
    "E": "Eletricista",
    "M": "Mecânico",
    "P": "Programador",
    "R": "Projetista",
    "A": "Administrativo",
    "N": "Engenheiro"
};

// Funções ao carregar a página
window.onload = () => {
    ColorMode(localStorage.getItem('colorMode'));
    LoadScripts();
    document.getElementById('nav-name').textContent = worker.Nome.value;
    document.getElementById("date").valueAsDate = new Date();

    if (worker['Funções'].value.includes('A')) document.getElementById('nav-manage-workers').classList.remove('hidden');

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

// Gerenciar colaboradores
document.getElementById('nav-manage-workers').onclick = () => {
    document.querySelectorAll('.active').forEach((elmnt) => {
        elmnt.classList.remove('active');
    });
    document.getElementById('nav-manage-workers').classList.add('active');
    HTML.load('manage-workers');
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
    ipc.send('show-main', 'worker_screen');
}

// Botões de janela
document.querySelectorAll('.close-btn')[0].onclick = () => {
    remote.getCurrentWindow().close()
};

function LoadScripts() {
    var back_page;

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

    HTML.loadScript('manage-workers', () => {
        let btn_save = document.getElementById('btn-save'),
            btn_reset = document.getElementById('btn-reset'),
            input_email = document.getElementById('input-email'),
            input_password = document.getElementById('input-password'),
            select = document.getElementById('list-workers');

        const workMan = new WorkerManager({
            list: 'list-workers',
            name: 'input-name',
            registry: 'input-regs',
            email: 'input-email',
            password: 'input-password',
            status: 'loading',
            switches: {
                journey: {
                    hourly: 'chk-hourly',
                    monthly: 'chk-monthly'
                },
                functions: {
                    adm: 'chk-adm',
                    eng: 'chk-eng',
                    ele: 'chk-ele',
                    mec: 'chk-mec',
                    prog: 'chk-prog',
                    proj: 'chk-proj'
                }
            },
            chart: 'adm-delay-chart'
        });
        workMan.getList();

        btn_reset.onclick = () => {
            select.onchange();
            input_password.value = '';
        };

        btn_save.onclick = () => {
            workMan.updateWorker();
        };
    });

    HTML.loadScript('reg-type', () => {
        WorkerLabor.clear();

        let btn_sr = document.getElementById('btn-sr'),
            btn_activities = document.getElementById('btn-activities');

        btn_sr.onclick = () => {
            HTML.load('reg-sr');
        }
        btn_activities.onclick = () => {
            HTML.load('reg-function');
        }
    });

    HTML.loadScript('reg-function', () => {
        let nextbutton = document.querySelectorAll('[btn-next]')[0],
            backbutton = document.querySelectorAll('[btn-back]')[0];

        let list_functions = document.getElementById('list-functions');

        worker['Funções'].value.split('').forEach(s => {
            if (s != ' ' && s != 'D') {
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
        back_page = 'reg-activity';
        let department = remote.getGlobal('sql').department;

        let list_activities = document.getElementById('list-activities'),
            list_descriptions = document.getElementById('list-descriptions');

        let nextbutton = document.querySelectorAll('[btn-next]')[0],
            backbutton = document.querySelectorAll('[btn-back]')[0];

        let function_activities = remote.getGlobal('activities')['Activities'][WorkerLabor.info.function];

        Object.keys(function_activities).forEach(d => {
            let option = document.createElement('option');
            if (function_activities[d]['Project']) option.setAttribute('project', function_activities[d]['Project']);
            if (function_activities[d]['WO each']) option.setAttribute('wo-each', function_activities[d]['WO each']);
            if (function_activities[d]['WO as']) option.setAttribute('wo-as', function_activities[d]['WO as']);
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
            let is_project = list_activities.selectedOptions[0].hasAttribute('project'),
                wo_each = list_activities.selectedOptions[0].hasAttribute('wo-each'),
                wo_as = list_activities.selectedOptions[0].getAttribute('wo-as');

            if (is_project) {
                WorkerLabor.updateInfo({
                    description: list_descriptions.selectedOptions[0].value
                });
                HTML.load('reg-projects');
            } else {
                if (wo_each) {
                    let description = list_descriptions.selectedOptions[0].value;
                    let wo = department.filter(d => { return d['Descrição'].value.toUpperCase() == description.toUpperCase() })[0][WorkerLabor['info']['function']]['value'];
                    WorkerLabor.updateInfo({
                        description: description,
                        wo: wo
                    });
                    HTML.load('reg-time');
                } else {
                    let wo = department.filter(d => { return d['Descrição'].value.toUpperCase() == wo_as.toUpperCase() })[0][WorkerLabor['info']['function']]['value'];
                    WorkerLabor.updateInfo({
                        description: list_descriptions.selectedOptions[0].value,
                        wo: wo
                    });
                    HTML.load('reg-time');
                }
            }
        };
    });

    HTML.loadScript('reg-projects', () => {
        let backbutton = document.querySelectorAll('[btn-back]')[0];
        backbutton.onclick = () => { HTML.load('reg-activity') };
        back_page = 'reg-projects';

        ipc.on('reg-project-time', (evt, arg) => {
            WorkerLabor.updateInfo(arg);
            HTML.load('reg-time');
        });

        document.querySelectorAll('.badge-image').forEach(e => {
            e.onclick = () => {
                ipc.send('select-project', { badge: e.id, info: WorkerLabor.getLabor() });
            };
        });

        document.getElementById('btn-others').onclick = () => {
            ipc.send('select-project', { badge: 'common', info: WorkerLabor.getLabor() });
        }
    });

    HTML.loadScript('reg-sr', () => {
        back_page = 'reg-sr';
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

        inputwo.onkeyup = function() {
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
        };

        inputsr.onkeyup = function() {
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
        };

        inputwo.value = (typeof(WorkerLabor.info.wo) === 'undefined' ? '' : WorkerLabor.info.wo);
        inputwo.onkeyup();
    });

    HTML.loadScript('reg-time', () => {
        WorkerLabor.getData();

        let _data = WorkerLabor.info;
        let hasTime = (_data.laborTime.common > 0 || _data.laborTime.extra > 0);

        let renderTable = () => {
            let container = document.getElementById('table-container');

            if (hasTime) {
                let thead = document.createElement('thead');
                let table = document.createElement('table');
                table.classList.add('table');
                thead.innerHTML = `
                  <thead>
                      <tr>
                          <th scope="col">Função</th>
                          <th scope="col">WO</th>
                          <th scope="col">Descrição</th>
                          <th scope="col">Tempo</th>
                          <th scope="col">Extra</th>
                      </tr>
                  </thead>`;
                table.appendChild(thead);

                let tbody = document.createElement('tbody');

                if (_data.laborTime.common > 0) {
                    let trCommon = document.createElement('tr');
                    trCommon.innerHTML = `
                        <th scope="row">${_data['function']}</th>
                        <th>${_data['wo']}</th>
                        <th>${_data['description'].length > LIMIT ? _data['description'].substring(0, LIMIT) + '...' : _data['description']}</th>
                        <th>${_data.laborTime.common}</th>
                        <th>Não</th>`;
                    tbody.appendChild(trCommon);
                }

                if (_data.laborTime.extra > 10) {
                    let trExtra = document.createElement('tr');
                    trExtra.innerHTML = `
                        <th scope="row">${_data['function']}</th>
                        <th>${_data['wo']}</th>
                        <th>${_data['description'].length > LIMIT ? _data['description'].substring(0, LIMIT) + '...' : _data['description']}</th>
                        <th>${data.laborTime.extra}</th>
                        <th>Sim</th>`;
                    tbody.appendChild(trExtra);
                }
                table.appendChild(tbody);

                container.innerHTML = '';
                container.appendChild(table);
            } else container.innerHTML = `<h6 class="display-6 text-center">Não há registros para mostrar...</h6>`;
        }

        renderTable();

        document.querySelectorAll('[btn-back]')[0]
            .onclick = () => {
                HTML.load(back_page);
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
                renderTable();
            }, 500);

        };

        document.getElementById('reg-btn').onclick = () => {
            ipc.send('show-confirm-dialog', WorkerLabor.getLabor());
        }
    });
}