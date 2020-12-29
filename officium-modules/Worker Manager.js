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
const chart_js_1 = require("chart.js");
const Charts_1 = require("./Charts");
const MSSQL_1 = require("./MSSQL");
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
    updateWorker() {
        return __awaiter(this, void 0, void 0, function* () {
            let _components = this.components, _SQL = this.SQL_DRIVER, _switches = this.components.switches;
            let select = document.getElementById(`${_components.list}`), input_name = document.getElementById(`${_components.name}`), input_registry = document.getElementById(`${_components.registry}`), input_email = document.getElementById(`${_components.email}`), input_password = document.getElementById(`${_components.password}`);
            select.innerHTML = '';
            let chk_hourly = document.getElementById(`${_switches.journey.hourly}`), chk_monthly = document.getElementById(`${_switches.journey.monthly}`), chk_adm = document.getElementById(`${_switches.functions.adm}`), chk_eng = document.getElementById(`${_switches.functions.eng}`), chk_ele = document.getElementById(`${_switches.functions.ele}`), chk_mec = document.getElementById(`${_switches.functions.mec}`), chk_prog = document.getElementById(`${_switches.functions.prog}`), chk_proj = document.getElementById(`${_switches.functions.proj}`);
            let journey_query = `${chk_hourly.checked ? 'H' : chk_monthly.checked ? 'M' : 'H'}`, functions_query = `${chk_adm.checked ? 'A' : ' '}${chk_eng.checked ? 'N' : ' '}${chk_ele.checked ? 'E' : ' '}${chk_mec.checked ? 'M' : ' '}${chk_prog.checked ? 'P' : ' '}${chk_proj.checked ? 'R' : ' '}`;
            // UPDATE table_name
            // SET column1 = value1, column2 = value2, ...
            // WHERE condition;
            return new Promise((resolve, reject) => {
                console.log(MSSQL_1.MSSQL.QueryBuilder('UpdateWorker', input_registry.value, input_password.value, input_email.value, input_name.value, functions_query, journey_query));
                _SQL.execute(MSSQL_1.MSSQL.QueryBuilder('UpdateWorker', input_registry.value, input_password.value, input_email.value, input_name.value, functions_query, journey_query))
                    .then(() => { resolve(); })
                    .catch(() => { reject(); });
            });
        });
    }
}
exports.WorkerManager = WorkerManager;
