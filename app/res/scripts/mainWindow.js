const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

// Dependências
window.jQuery = window.$ = require('jquery');
const Popper = require('@popperjs/core');
require('bootstrap');

// Ação do botão "fechar"
$(".close").click(function() {
    remote.getCurrentWindow().close();
});

// Ativa os balões de dicas
$(function() {
    $('[data-toggle="tooltip"]').tooltip()
});

// Conecta ao banco de dados
$(document).ready(function() {
    $("#inRegister").focus();
});

// Ação do botão "Entrar"
$("#btnEnter").click(function() {
    var registro = $("#inRegister").val();

    connectSQL((e) => {
        let notif;
        if (!e) {
            notif = new window.Notification('Joyson GMO', {
                body: "Erro de conexão com o servidor!",
            });
            notif.onclick = () => {
                remote.getCurrentWindow().focus();
            };
        } else {
            selectSQL("SELECT [Nome], [Registro], [Funções], [Jornada] FROM [Colaboradores] WHERE [Registro] = " + registro, (resultSet) => {
                if (jQuery.isEmptyObject(resultSet)) {
                    console.log("[mainWindow]: Colaborador não registrado/encontrado!");
                } else {
                    remote.getGlobal("defs").colaborador = resultSet[0];
                    ipc.send('open-workerScreen');
                }
            });
        }
    });
});

// Ação do botão físico "Enter" - Entrar
$("#inRegister").keypress(function(e) {
    if (e.keyCode === 13) {
        e.preventDefault();
        $("#btnEnter").click();
    }
});