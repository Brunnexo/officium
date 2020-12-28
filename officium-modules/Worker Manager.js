"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerManager = void 0;
const MSSQL_1 = require("./MSSQL");
const chart_js_1 = require("chart.js");
const Charts_1 = require("./Charts");
class WorkerManager {
    constructor(c) {
        this.SQL_DRIVER = new MSSQL_1.MSSQL();
        this.data = new Array();
        if (typeof (c) !== 'undefined')
            this.components = c;
    }
    updateComponents(comp) {
        Object.keys(comp)
            .forEach((val) => {
            this.components[val] = comp[val];
        });
    }
    getList() {
        return __awaiter(this, void 0, void 0, function* () {
            let _components = this.components, _SQL = this.SQL_DRIVER, _data = this.data, _switches = this.components.switches;
            let select = document.getElementById(`${_components.list}`), input_name = document.getElementById(`${_components.name}`), input_registry = document.getElementById(`${_components.registry}`), input_email = document.getElementById(`${_components.email}`), input_password = document.getElementById(`${_components.password}`);
            select.innerHTML = '';
            let chk_hourly = document.getElementById(`${_switches.journey.hourly}`), chk_monthly = document.getElementById(`${_switches.journey.monthly}`), chk_adm = document.getElementById(`${_switches.functions.adm}`), chk_eng = document.getElementById(`${_switches.functions.eng}`), chk_ele = document.getElementById(`${_switches.functions.ele}`), chk_mec = document.getElementById(`${_switches.functions.mec}`), chk_prog = document.getElementById(`${_switches.functions.prog}`), chk_proj = document.getElementById(`${_switches.functions.proj}`);
            function input_change(ev) {
                let selected = select.selectedOptions[0];
                if (input_name.value != selected.getAttribute('name') ||
                    input_registry.value != selected.getAttribute('reg') ||
                    input_email.value != selected.getAttribute('email') ||
                    input_password.value != '') {
                    _components.buttons.forEach(e => {
                        document.getElementById(e).removeAttribute('disabled');
                    });
                }
                else {
                    _components.buttons.forEach(e => {
                        document.getElementById(e).setAttribute('disabled', '');
                    });
                }
            }
            input_name.onchange = input_registry.onchange = input_email.onchange = input_password.onchange = input_change;
            function toggle_change(ev) {
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
                }
                else {
                    _components.buttons.forEach(e => {
                        document.getElementById(e).setAttribute('disabled', '');
                    });
                }
            }
            chk_hourly.onchange = chk_monthly.onchange = chk_adm.onchange = chk_ele.onchange = chk_eng.onchange = chk_mec.onchange = chk_prog.onchange = chk_proj.onchange = toggle_change;
            let status = document.getElementById(`${_components.status}`);
            _data = new Array();
            yield _SQL.select(MSSQL_1.MSSQL.QueryBuilder('Workers'), (data) => {
                _data.push(data);
            });
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
            };
            select.onchange(null);
            _data = [];
            yield _SQL.select(MSSQL_1.MSSQL.QueryBuilder('Delay'), (data) => {
                _data.push(data);
            });
            let _chart = document.getElementById(`${this.components.chart}`);
            let splitData = {
                dates: new Array,
                count: new Array,
                colors: Charts_1.randomColors(_data.length)
            };
            _data.forEach(d => {
                splitData.dates.push(d['Data'].value);
                splitData.count.push(d['Atrasos'].value);
            });
            if (!(typeof (this.chart) === 'undefined'))
                this.chart.destroy();
            this.chart = new chart_js_1.Chart(_chart, {
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
        });
    }
}
exports.WorkerManager = WorkerManager;
