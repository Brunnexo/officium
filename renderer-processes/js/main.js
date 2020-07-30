const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;
const { MSSQL, queryBuilder } = require('../../officium-modules/sqlutils');

// Dependências
window.jQuery = window.$ = require('jquery');
const Popper = require('@popperjs/core');
require('bootstrap');

// MSSQL
const SQL_DRIVER = new MSSQL(remote.getGlobal('sql').config);

// Botão fechar
$('#close').click(() => {
    remote.getCurrentWindow().close();
});

$(document).ready(() => {
    $('body').css('user-select', 'none');
    $('#close').css({
        "user-select": "none",
        "padding": "5px",
        "color": "#f8f9fa",
        "-webkit-app-region": "no-drag;"
    });
    $(':text').focus();
    $(':text, :password').css({
        "transition": "1s",
        "-webkit-app-region": "no-drag;"
    });
    $('#btnClear, #btnAuth').css({
        "-webkit-app-region": "no-drag;"
    });
    $(':password').focus(() => {
        $('#instruction').html('Insira sua senha administrativa');
    });
    $(':text').focus(() => {
        $('#instruction').html('Insira seu registro');
    });
});

$(':text, :password').keypress((key) => {
    if (key.charCode == 13) $('#btnAuth').click();
});

$('#btnAuth').click(() => {
    authenticate($(':text').val(), $(':password').val());
});

$('#btnClear').click(() => {
    $(':text').val('').focus();
    $(':password').val('').hide();
});

// Autenticar usuário
function authenticate(register, password) {
    if (password == '') {
        var worker = [];
        if (register == '') setWarning(':text');
        else {
            SQL_DRIVER.select(queryBuilder('Register', register), (data) => {
                    worker.push(data);
                })
                .then(() => {
                    if (worker == '') setWarning(':text');
                    else {
                        remote.getGlobal('data').worker = worker[0];
                        ipc.send('open-workerScreen');
                    }
                });
        }
    } else {
        SQL_DRIVER.select(queryBuilder('Authenticate', $(':password').val(), $(':text').val()), (data) => {
            ipc.send('open-workerScreen', data.Autenticado.value);
        });
    }
}

ipc.on('adm-password-require', () => {
    $(':password').removeAttr('readonly').fadeIn('slow').focus();
    setWarning(':password');
});

// Altera o campo de texto para cor de "aviso"
function setWarning(sel) {
    $(sel).toggleClass("bg-warning text-white");
    clearTimeout(delay);
    var delay = setTimeout(function() {
        $(`${sel}`).toggleClass("bg-warning text-white");
    }, 2000);
}