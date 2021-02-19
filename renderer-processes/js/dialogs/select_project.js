const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;
const { ColorMode } = require('../../../officium-modules/Officium');

const badge = ipc.sendSync('request-badge-name');
const data = ipc.sendSync('request-labor-info');

const LIMIT = 50;

var result = {};

window.onload = () => {
    ColorMode(localStorage.getItem('colorMode'));

    remote.getCurrentWindow()
        .on('focus', () => {
            document.querySelector('.view').classList.remove('no-focus');
        })
        .on('blur', () => {
            document.querySelector('.view').classList.add('no-focus');
        });

    if (badge == 'common') setImmediate(() => { fill_list_common() });
    else setImmediate(() => { fill_list_project() });
}

document.getElementById('btn-cancel').onclick = () => {
    remote.getCurrentWindow().close();
};

document.getElementById('btn-confirm').onclick = () => {
    console.log(JSON.stringify(result, null, '\t'));
    ipc.send('project-selected', result);
    remote.getCurrentWindow().close();
};

function fill_list_common() {
    let _function = data['function'];
    let projects = remote.getGlobal('sql').general;
    let search = projects.filter(d => { return d[_function]['value'] != null });
    let btn_confirm = document.getElementById('btn-confirm');

    let input_wo = document.getElementById('input-wo'),
        input_description = document.getElementById('input-description'),
        input_os = document.getElementById('input-os'),
        input_equipment = document.getElementById('input-equipment'),
        select = document.getElementById('project-list');

    if (search.length > 0) {
        search.forEach(data => {
            let option = document.createElement('option');
            option.setAttribute('wo', data[_function].value);
            option.setAttribute('description', data['Descrição'].value);
            option.setAttribute('equipment', data['Equipamento'].value);
            option.setAttribute('os', data['OS'].value);
            option.innerHTML = `${data['Descrição'].value.length > LIMIT ? data['Descrição'].value.substring(0, LIMIT) + '...' : data['Descrição'].value}`;
            select.appendChild(option);
        });

        select.onchange = () => {
            let selected = select.selectedOptions[0];
            input_equipment.value = selected.getAttribute('equipment');
            input_os.value = selected.getAttribute('os');
            input_description.value = selected.getAttribute('description');
            input_wo.value = selected.getAttribute('wo');

            result = { wo: input_wo.value };
        };

        select.onchange();
        document.getElementById('loading').style.display = 'none';
    } else {
        btn_confirm.setAttribute('disabled', '');
        document.getElementById('loading').style.display = 'none';
    }
}

function fill_list_project() {
    let projects = remote.getGlobal('sql').projects

    let _function = data['function'];
    let search = projects.filter(d => { return ((d['Cliente']['value'].toUpperCase() == badge.toUpperCase()) && (d[_function]['value'] != null)) });
    let btn_confirm = document.getElementById('btn-confirm');
    let input_wo = document.getElementById('input-wo'),
        input_description = document.getElementById('input-description'),
        input_project = document.getElementById('input-project'),
        input_os = document.getElementById('input-os'),
        input_equipment = document.getElementById('input-equipment'),
        select = document.getElementById('project-list');
    if (search.length > 0) {
        search.forEach(data => {
            let option = document.createElement('option');
            option.setAttribute('wo', data[_function].value);
            option.setAttribute('description', data['Descrição'].value);
            option.setAttribute('project', data['Projeto'].value);
            option.setAttribute('equipment', data['Equipamento'].value);
            option.setAttribute('os', data['OS'].value);
            option.innerHTML = `${data['Descrição'].value.length > LIMIT ? data['Descrição'].value.substring(0, LIMIT) + '...' : data['Descrição'].value}`;
            select.appendChild(option);
        });
        select.onchange = () => {
            let selected = select.selectedOptions[0];
            input_equipment.value = selected.getAttribute('equipment');
            input_os.value = selected.getAttribute('os');
            input_project.value = selected.getAttribute('project');
            input_description.value = selected.getAttribute('description');
            input_wo.value = selected.getAttribute('wo');

            result = { wo: input_wo.value };
        };
        select.onchange();
        document.getElementById('loading').style.display = 'none';
    } else {
        btn_confirm.setAttribute('disabled', '');
        document.getElementById('loading').style.display = 'none';
    }

}