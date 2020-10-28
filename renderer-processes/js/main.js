// Electron
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

// Extensões internas
const { MSSQL, QueryBuilder } = require('../../officium-modules/sqlutils/');
const { ColorMode } = require('../../officium-modules/colormode');

const SQL_DRIVER = new MSSQL(remote.getGlobal('sql').config);

window.jQuery = window.$ = require('jquery');

// Página pronta
$(document).ready(() => {
    ColorMode(localStorage.getItem('colorMode'));
    $('#welcome').text(welcome());
});

// Processo inter-comunicação
ipc.on('adm-password-require', () => {
    $(':password').removeAttr('readonly').fadeIn('slow').focus();
    warning('Insira a senha');
});

// Botões
// Fechar
$('.close-btn').click(() => {
    remote.getCurrentWindow().close();
});

// Limpar campos
$('#btnClear').click(() => {
    $(':text').val('').focus();
    $(':password').val('').hide();
});

// Autenticar
$('#btnAuth').click(() => {
    authenticate($(':text').val(), $(':password').val());
});

$(':text, :password').keypress((key) => {
    if (key.charCode == 13) $('#btnAuth').click();
});

// Autenticar

function authenticate(registry, password) {
    let worker = [];
    if (password == '') {
        if (registry == '') warning('Registro inválido!');
        else {
            SQL_DRIVER.select(QueryBuilder('Registry', registry), (data) => {
                    worker.push(data);
                })
                .then(() => {
                    if (worker == '') warning('Não há funcionário registrado!');
                    else {
                        remote.getGlobal('data').worker = worker[0];
                        ipc.send('open-workerScreen');
                    }
                });
        }
    } else {
        SQL_DRIVER.select(QueryBuilder('Authenticate', $(':password').val(), $(':text').val()), (data) => {
            ipc.send('open-workerScreen', data.Autenticado.value);
        });
    }
}

function warning(sel) {
    let t = $('#instruction').text();
    $('#instruction')
        .hide()
        .addClass('text-danger')
        .text(sel)
        .fadeIn();
    clearTimeout(this.delay);
    this.delay = setTimeout(() => {
        $('#instruction').removeClass('text-danger')
            .hide()
            .text(t)
            .fadeIn();
    }, 3000);
}

function welcome() {
    let d = new Date().getHours();
    return (d >= 18 ? 'Boa noite!' : d >= 12 ? 'Boa tarde!' : 'Bom dia!');
}

const validateIP = (ipaddr) => (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddr));