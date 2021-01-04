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

        document.querySelectorAll('.badge-image').forEach(e => {
            e.onclick = () => {
                ipc.send('select-project', { badge: e.id, info: WorkerLabor.getLabor() });
                ipc.once('reg-time', (evt, arg) => {
                    WorkerLabor.updateInfo(arg);
                    HTML.load('reg-time');
                });
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

        searchbutton.onclick = () => {
            ipc.send('sr-search');
            ipc.once('sr-fill', (evt, arg) => {
                inputwo.value = arg.wo;
                inputsr.value = arg.sr;
                inputservice.value = arg.description;
                nextbutton.removeAttribute('disabled');
            });
        };

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
        const LIMIT = 40;
        WorkerLabor.getData();
        let renderTable = () => {
            let _data = WorkerLabor.info;
            let hasTime = (_data.laborTime.common > 0 || _data.laborTime.extra > 0);
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
                        <th>${_data.laborTime.extra}</th>
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
            let _laborTime = WorkerLabor.info.laborTime,
                time = (_laborTime.common + _laborTime.extra);

            // ipc.send('show-confirm-dialog', WorkerLabor.getLabor());
            ipc.send('show-dialog', {
                title: 'Confirmação',
                type: 'yes-no',
                content: `Confirmar registro de ${time} ${time > 1 ? 'minutos' : 'minuto'} para a WO ${WorkerLabor.info['wo']}?`
            });
            // Comunicação inter-processual
        }
    });
}