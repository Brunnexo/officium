// Electron
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;
const { ColorMode } = require('../../officium-modules/Officium');

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
    ipc.send('confirm');
    remote.getCurrentWindow().close();
};


function renderTable() {
    let data = ipc.sendSync('request-table-data');
    let container = document.getElementById('container');

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

    data.forEach((d) => {
        if (d.Tempo > 0) {
            let tr = document.createElement('tr');
            tr.innerHTML = `
              <th>${d.Função}</th>
              <th>${d.WO}</th>
              <th>${d.Descrição}</th>
              <th>${d.Tempo}</th>
              <th>${d.Extra}</th>`;
            tbody.appendChild(tr);
        }
    });
    table.appendChild(tbody);
    container.innerHTML = '';
    container.appendChild(table);
}