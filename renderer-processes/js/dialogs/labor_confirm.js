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