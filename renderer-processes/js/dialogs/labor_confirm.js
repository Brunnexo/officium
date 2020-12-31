// Electron
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;
const { ColorMode, MSSQL } = require('../../../officium-modules/Officium');

const data = ipc.sendSync('request-labor-info');
const SQL_DRIVER = new MSSQL();
const LIMIT = 40;

var hasTime = (data.laborTime.common > 0 || data.laborTime.extra > 0);

window.onload = () => {
    ColorMode(localStorage.getItem('colorMode'));
    renderTable();
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
    if (hasTime) {
        let query = '';
        if (data.laborTime.common > 0) {
            query += MSSQL.QueryBuilder('InsertLabor', data.registry, data.date, data.function, data.wo,
                data['description'].length > LIMIT ? data['description'].substring(0, LIMIT) + '...' : data['description'],
                data.laborTime.extra, '0');
        }
        if (data.laborTime.extra > 10) {
            query += MSSQL.QueryBuilder('InsertLabor', data.registry, data.date, data.function, data.wo,
                data['description'].length > LIMIT ? data['description'].substring(0, LIMIT) + '...' : data['description'],
                data.laborTime.extra, '1');
        }
        SQL_DRIVER.execute(query)
            .then(() => {
                ipc.send('show-resume');
                remote.getCurrentWindow().close();
            });
    }
};

function getToday() {
    let d = new Date();
    let d_string = d.toISOString();
    return d_string.substring(0, d_string.indexOf('T'));
}

function renderTable() {
    let container = document.getElementById('container');
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

        if (data.laborTime.common > 0) {
            let trCommon = document.createElement('tr');
            trCommon.innerHTML = `
                <th scope="row">${data['function']}</th>
                <th>${data['wo']}</th>
                <th>${data['description'].length > LIMIT ? data['description'].substring(0, LIMIT) + '...' : data['description']}</th>
                <th>${data.laborTime.common}</th>
                <th>Não</th>`;
            tbody.appendChild(trCommon);
        }

        if (data.laborTime.extra > 10) {
            let trExtra = document.createElement('tr');
            trExtra.innerHTML = `
                <th scope="row">${data['function']}</th>
                <th>${data['wo']}</th>
                <th>${data['description'].length > LIMIT ? data['description'].substring(0, LIMIT) + '...' : data['description']}</th>
                <th>${data.laborTime.extra}</th>
                <th>Sim</th>`;
            tbody.appendChild(trExtra);
        }
        table.appendChild(tbody);

        container.innerHTML = '';
        container.appendChild(table);
    } else container.innerHTML = `<h5 class="display-4 text-center">Não há registros para mostrar...</h5>`;
}