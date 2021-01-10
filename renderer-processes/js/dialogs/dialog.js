const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;
const { ColorMode } = require('../../../officium-modules/Officium');

window.onload = () => {
    ColorMode(localStorage.getItem('colorMode'));

    remote.getCurrentWindow()
        .on('focus', () => {
            document.querySelector('.view').classList.remove('no-focus');
        })
        .on('blur', () => {
            document.querySelector('.view').classList.add('no-focus');
        });

    var btn1 = document.getElementById('btn-1'),
        btn2 = document.getElementById('btn-2'),
        content = document.getElementById('content'),
        title = document.getElementById('title');

    (function() {
        let opt = ipc.sendSync('get-dialog-options');

        switch (opt['type']) {
            case 'yes-no':
                btn1.innerHTML = 'Não';
                btn1.classList.add('btn-danger');
                btn1.onclick = () => { send(false) };
                btn2.innerHTML = 'Sim';
                btn2.classList.add('btn-success');
                btn2.onclick = () => { send(true) };
                break;
            case 'info':
                btn1.remove();
                btn2.innerHTML = 'OK';
                btn2.classList.add('btn-success');
                btn2.onclick = () => { send(true) };
                break;
        }
        title.innerHTML = opt['title'];
        content.innerHTML = opt['content'];
    })();

    function send(arg) {
        ipc.send('dialog-closed', arg);
        remote.getCurrentWindow().close();
    }
}