import { MSSQL } from './MSSQL';
import { Chart } from 'chart.js';
import { randomColors } from './Charts';

interface Components {
    list?: string,
    name?: string,
    registry?: string,
    email?: string,
    password?: string,

    buttons?: Array<string>,

    status?: string,

    switches?: {
        journey: {
            hourly: string,
            monthly: string
        },
        functions?: {
            adm?: string,
            eng?: string,
            ele?: string,
            mec?: string,
            prog?: string,
            proj?: string
        }
    },

    chart?: string
}

class WorkerManager {
    protected components: Components;
    protected data: Array<object>;
    protected chart?: Chart;
    protected SQL_DRIVER: MSSQL;

    constructor(c?: Components) {
        this.SQL_DRIVER = new MSSQL();
        this.data = new Array<object>();
        if (typeof(c) !== 'undefined') this.components = c;
    }

    updateComponents(comp: Components) {
        Object.keys(comp)
            .forEach((val) => {
                this.components[val] = comp[val];
        });
    }

    async getList() {
        let _components = this.components,
            _SQL = this.SQL_DRIVER,
            _data = this.data,
            _switches = this.components.switches;

        let select = (document.getElementById(`${_components.list}`) as HTMLSelectElement),
            input_name = (document.getElementById(`${_components.name}`) as HTMLInputElement), 
            input_registry = (document.getElementById(`${_components.registry}`) as HTMLInputElement),
            input_email = (document.getElementById(`${_components.email}`) as HTMLInputElement),
            input_password = (document.getElementById(`${_components.password}`) as HTMLInputElement);

            select.innerHTML = '';

        let chk_hourly = (document.getElementById(`${_switches.journey.hourly}`) as HTMLInputElement),
            chk_monthly = (document.getElementById(`${_switches.journey.monthly}`) as HTMLInputElement),
            chk_adm = (document.getElementById(`${_switches.functions.adm}`) as HTMLInputElement),
            chk_eng = (document.getElementById(`${_switches.functions.eng}`) as HTMLInputElement),
            chk_ele = (document.getElementById(`${_switches.functions.ele}`) as HTMLInputElement),
            chk_mec = (document.getElementById(`${_switches.functions.mec}`) as HTMLInputElement),
            chk_prog = (document.getElementById(`${_switches.functions.prog}`) as HTMLInputElement),
            chk_proj = (document.getElementById(`${_switches.functions.proj}`) as HTMLInputElement);

        function input_change(ev: Event) {
            let selected = select.selectedOptions[0];
            if (input_name.value != selected.getAttribute('name') ||
                input_registry.value != selected.getAttribute('reg') ||
                input_email.value != selected.getAttribute('email') ||
                input_password.value != '') {
                    _components.buttons.forEach(e => {
                        document.getElementById(e).removeAttribute('disabled');
                    });
                } else {
                    _components.buttons.forEach(e => {
                        document.getElementById(e).setAttribute('disabled', '');
                    });
                }
        }
        input_name.onchange = input_registry.onchange = input_email.onchange = input_password.onchange = input_change;

        function toggle_change(ev: Event) {
            let selected = select.selectedOptions[0];

            if (chk_hourly.checked != (selected.getAttribute('journey') == 'H') ||
                chk_monthly.checked != (selected.getAttribute('journey') == 'M') ||
                chk_adm.checked != (selected.getAttribute('functions').includes('A')) ||
                chk_ele.checked != (selected.getAttribute('functions').includes('E')) ||
                chk_eng.checked != (selected.getAttribute('functions').includes('N')) ||
                chk_mec.checked != (selected.getAttribute('functions').includes('M')) ||
                chk_prog.checked != (selected.getAttribute('functions').includes('P')) ||
                chk_proj.checked != (selected.getAttribute('functions').includes('R'))) {
                    _components.buttons.forEach(e => {
                        document.getElementById(e).removeAttribute('disabled');
                    });
            } else {
                _components.buttons.forEach(e => {
                    document.getElementById(e).setAttribute('disabled', '');
                });
            }
        }
        chk_hourly.onchange = chk_monthly.onchange = chk_adm.onchange = chk_ele.onchange = chk_eng.onchange = chk_mec.onchange = chk_prog.onchange = chk_proj.onchange = toggle_change;

        let status = document.getElementById(`${_components.status}`);

        _data = new Array<object>();
        await _SQL.select(MSSQL.QueryBuilder('Workers'), (data: any) => {
            _data.push(data);
        })
        _data.forEach(d => {
            let option = document.createElement('option');
            option.setAttribute('reg', d['Registro'].value);
            option.setAttribute('email', d['Email'].value != null ? d['Email'].value : '');
            option.setAttribute('functions', d['Funções'].value);
            option.setAttribute('journey', d['Jornada'].value);
            option.setAttribute('name', d['Nome'].value);
            option.innerHTML = `${d['Nome'].value}`;
            select.appendChild(option);
        });
        status.style.display = 'none';
        select.onchange = () => {
            input_name.value = select.selectedOptions[0].getAttribute('name');
            input_registry.value = select.selectedOptions[0].getAttribute('reg');
            input_email.value = select.selectedOptions[0].getAttribute('email');
            chk_hourly.checked = (select.selectedOptions[0].getAttribute('journey') == 'H');
            chk_monthly.checked = (select.selectedOptions[0].getAttribute('journey') == 'M');
            chk_adm.checked = (select.selectedOptions[0].getAttribute('functions').includes('A'));
            chk_ele.checked = (select.selectedOptions[0].getAttribute('functions').includes('E'));
            chk_eng.checked = (select.selectedOptions[0].getAttribute('functions').includes('N'));
            chk_mec.checked = (select.selectedOptions[0].getAttribute('functions').includes('M'));
            chk_prog.checked = (select.selectedOptions[0].getAttribute('functions').includes('P'));
            chk_proj.checked = (select.selectedOptions[0].getAttribute('functions').includes('R'));
        }

        select.onchange(null);

        _data = [];
        await _SQL.select(MSSQL.QueryBuilder('Delay'), (data: any) => {
            _data.push(data);
        });
        let _chart = document.getElementById(`${this.components.chart}`);


        let splitData = {
            dates: new Array,
            count: new Array,
            colors: randomColors(_data.length)
        }

        _data.forEach(d => {
            splitData.dates.push(d['Data'].value);
            splitData.count.push(d['Atrasos'].value);
        });

        if (!(typeof (this.chart) === 'undefined')) this.chart.destroy();
        this.chart = new Chart((_chart as HTMLCanvasElement), {
            type: 'line',
            data: {
                labels: splitData.dates,
                datasets: [
                    {
                        data: splitData.count,
                        borderColor: 'rgba(150, 150, 150, 0.5)',
                        borderWidth: 2,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                legend: {
                    display: false
                },
                title: {
                    display: false,
                }
            }      
        });
    }
}

export { WorkerManager };

