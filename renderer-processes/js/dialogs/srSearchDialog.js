// Electron
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;
const e = __dirname;
const { ColorMode } = require(e);

const srs = remote.getGlobal('sql').srs;

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

    setImmediate(() => {
        fill_list();
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

function fill_list() {
    let select = document.getElementById('sr-list'),
        responsibleinput = document.getElementById('input-responsible'),
        woinput = document.getElementById('input-wo'),
        srinput = document.getElementById('input-sr');

    srs.forEach((data) => {
        if (data['WO'].value !== null && data['WO'].value != '') {
            let option = document.createElement('option');
            option.setAttribute('responsible', data['Responsável'].value);
            option.setAttribute('wo', data['WO'].value);
            option.setAttribute('sr', data['SR'].value);
            option.setAttribute('description', data['Descrição'].value);
            option.innerHTML = `${data['SR'].value}: ${data['Descrição'].value.length > LIMIT ? data['Descrição'].value.substring(0, LIMIT) + '...' : data['Descrição'].value}`;
            select.appendChild(option);
        }
    })

    select.onchange = () => {
        result = {
            wo: select.selectedOptions[0].getAttribute('wo'),
            sr: select.selectedOptions[0].getAttribute('sr'),
            description: select.selectedOptions[0].getAttribute('description')
        }
        responsibleinput.value = select.selectedOptions[0].getAttribute('responsible');
        woinput.value = result.wo;
        srinput.value = result.sr;
    };

    select.onchange();
    document.getElementById('loading').style.display = 'none';
}