// Electron
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;
const { ColorMode } = require('../../officium-modules/Officium');

const srs = remote.getGlobal('sql').srs;

var result = {};

window.onload = () => {
    ColorMode(localStorage.getItem('colorMode'));
    fillList();

    remote.getCurrentWindow()
        .on('focus', () => {
            document.querySelector('.view').classList.remove('no-focus');
        })
        .on('blur', () => {
            document.querySelector('.view').classList.add('no-focus');
        });
}

// Botões de janela
document.getElementById('btn-cancel').onclick = () => {
    remote.getCurrentWindow().close();
};

document.getElementById('btn-confirm').onclick = () => {
    ipc.send('sr-found', result);
    remote.getCurrentWindow().close();
};

function fillList() {
    let select = document.getElementById('sr-list'),
        woinput = document.getElementById('input-wo'),
        srinput = document.getElementById('input-sr');

    srs.forEach((data, index) => {
        if (data['WO'].value !== null && data['WO'].value != '') {
            let option = document.createElement('option');
            option.setAttribute('wo', data['WO'].value);
            option.setAttribute('sr', data['SR'].value);
            option.setAttribute('description', data['Descrição'].value);
            option.innerHTML = `${data['Descrição'].value.length > 100 ? data['Descrição'].value.substring(0, 100) + '...' : data['Descrição'].value}`;
            select.appendChild(option);
        }
    })

    select.onchange = () => {
        result = {
            wo: select.selectedOptions[0].getAttribute('wo'),
            sr: select.selectedOptions[0].getAttribute('sr'),
            description: select.selectedOptions[0].getAttribute('description')
        }
        woinput.value = result.wo;
        srinput.value = result.sr;
    };

    select.onchange();

}