import { MSSQL } from './MSSQL';

interface Components {
    list?: string,
    name?: string,
    registry?: string,
    email?: string,
    password?: string,

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

    getList() {

        let _components = this.components,
            _SQL = this.SQL_DRIVER,
            _data = this.data,
            _switches = this.components.switches;

        let select = (document.getElementById(`${_components.list}`) as HTMLSelectElement),
            input_name = (document.getElementById(`${_components.name}`) as HTMLInputElement), 
            input_registry = (document.getElementById(`${_components.registry}`) as HTMLInputElement),
            input_email = (document.getElementById(`${_components.email}`) as HTMLInputElement),
            input_password = (document.getElementById(`${_components.password}`) as HTMLInputElement);

        let chk_hourly = (document.getElementById(`${_switches.journey.hourly}`) as HTMLInputElement),
            chk_monthly = (document.getElementById(`${_switches.journey.monthly}`) as HTMLInputElement),
            chk_adm = (document.getElementById(`${_switches.functions.adm}`) as HTMLInputElement),
            chk_eng = (document.getElementById(`${_switches.functions.eng}`) as HTMLInputElement),
            chk_ele = (document.getElementById(`${_switches.functions.ele}`) as HTMLInputElement),
            chk_mec = (document.getElementById(`${_switches.functions.mec}`) as HTMLInputElement),
            chk_prog = (document.getElementById(`${_switches.functions.prog}`) as HTMLInputElement),
            chk_proj = (document.getElementById(`${_switches.functions.proj}`) as HTMLInputElement);


        let status = document.getElementById(`${_components.status}`);

        _SQL.select(MSSQL.QueryBuilder('Workers'), (data: any) => {
            _data.push(data);
        }).then(() => {
            _data.forEach(d => {
                let option = document.createElement('option');
                option.setAttribute('email', d['Email'].value);
                option.setAttribute('regisrty', d['Registro'].value);
                option.setAttribute('functions', d['Funções'].value);
                option.setAttribute('journey', d['Jornada'].value);
                option.setAttribute('name', d['Nome'].value);
                option.innerHTML = `${d['Nome'].value}`;
                select.appendChild(option);
            });

            status.style.display = 'none';

            select.onchange = () => {
                input_name.value = select.selectedOptions[0].getAttribute('name');
                input_registry.value = select.selectedOptions[0].getAttribute('registry');
                input_email.value = select.selectedOptions[0].getAttribute('email');
                input_password.value = select.selectedOptions[0].getAttribute('password');

                console.log(select.selectedOptions[0].getAttribute('registry'));

                chk_hourly.checked = (select.selectedOptions[0].getAttribute('journey') == 'H');
                chk_monthly.checked = (select.selectedOptions[0].getAttribute('journey') == 'M');
            }

            select.onchange(null);
        });

    }
}

export { WorkerManager };

