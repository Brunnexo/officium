"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerManager = void 0;
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
        let _components = this.components, _SQL = this.SQL_DRIVER, _data = this.data, _switches = this.components.switches;
        let select = document.getElementById(`${_components.list}`), input_name = document.getElementById(`${_components.name}`), input_registry = document.getElementById(`${_components.registry}`), input_email = document.getElementById(`${_components.email}`), input_password = document.getElementById(`${_components.password}`);
        let chk_hourly = document.getElementById(`${_switches.journey.hourly}`), chk_monthly = document.getElementById(`${_switches.journey.monthly}`), chk_adm = document.getElementById(`${_switches.functions.adm}`), chk_eng = document.getElementById(`${_switches.functions.eng}`), chk_ele = document.getElementById(`${_switches.functions.ele}`), chk_mec = document.getElementById(`${_switches.functions.mec}`), chk_prog = document.getElementById(`${_switches.functions.prog}`), chk_proj = document.getElementById(`${_switches.functions.proj}`);
        let status = document.getElementById(`${_components.status}`);
        _SQL.select(MSSQL_1.MSSQL.QueryBuilder('Workers'), (data) => {
            _data.push(data);
        }).then(() => {
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
        });
    }
}
exports.WorkerManager = WorkerManager;
