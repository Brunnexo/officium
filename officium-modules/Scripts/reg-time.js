() => {
    const LIMIT = 40;
    WorkerLabor.getData();
    let renderTable = () => {
        let _data = WorkerLabor.info;
        let hasTime = (_data.laborTime.common > 0 || _data.laborTime.extra > 0);
        let container = document.getElementById('table-container');

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

            if (_data.laborTime.common > 0) {
                let trCommon = document.createElement('tr');
                trCommon.innerHTML = `
                    <th scope="row">${_data['function']}</th>
                    <th>${_data['wo']}</th>
                    <th>${_data['description'].length > LIMIT ? _data['description'].substring(0, LIMIT) + '...' : _data['description']}</th>
                    <th>${_data.laborTime.common}</th>
                    <th>Não</th>`;
                tbody.appendChild(trCommon);
            }

            if (_data.laborTime.extra > 10) {
                let trExtra = document.createElement('tr');
                trExtra.innerHTML = `
                    <th scope="row">${_data['function']}</th>
                    <th>${_data['wo']}</th>
                    <th>${_data['description'].length > LIMIT ? _data['description'].substring(0, LIMIT) + '...' : _data['description']}</th>
                    <th>${_data.laborTime.extra}</th>
                    <th>Sim</th>`;
                tbody.appendChild(trExtra);
            }
            table.appendChild(tbody);

            container.innerHTML = '';
            container.appendChild(table);
        } else container.innerHTML = `<h6 class="display-6 text-center">Não há registros para mostrar...</h6>`;
    }

    renderTable();

    document.querySelectorAll('[btn-back]')[0]
        .onclick = () => {
            HTML.load(back_page);
        };

    document.getElementById('input-time').onkeyup = () => {
        let time = Number(document.getElementById('input-time').value);
        let btn = document.getElementById('reg-btn');

        btn.setAttribute('disabled', '');

        clearTimeout(this.inputDelay);
        this.inputDelay = setTimeout(() => {
            if (!WorkerLabor.inputTime(time)) btn.setAttribute('disabled', '');
            else btn.removeAttribute('disabled');
            charts.render(WorkerLabor.info);
            renderTable();
        }, 500);
    }

    document.getElementById('reg-btn').onclick = () => {
        let _laborTime = WorkerLabor.info.laborTime,
            time = (_laborTime.common + _laborTime.extra);

        // ipc.send('show-confirm-dialog', WorkerLabor.getLabor());
        ipc.send('show-dialog', {
            title: 'Confirmação',
            type: 'yes-no',
            content: `Confirmar registro de ${time} ${time > 1 ? 'minutos' : 'minuto'} para a WO ${WorkerLabor.info['wo']}?`
        });

        ipc.once('dialog-reply', (evt, arg) => {
            console.log('Reply: ' + arg);
        });
    }
}