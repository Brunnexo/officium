const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;
const Tray = require('electron');

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

$(document).ready(function() {
    $('.passwordField').hide();
    $("#inRegister").focus();
});

$("#inRegister").focus(function() {
    $("#instruction").html('Insira seu registro');
});

$("#inPassword").focus(function() {
    $("#instruction").html('Insira sua senha');
});

// Atualização ao digitar no campo de registro
$("#inRegister").keyup(function(e) {
    let register = $("#inRegister").val();
    if (!(register === null || register === '') && !(e.keyCode == 9) && !(e.keyCode == 16)) {
        connectSQL((e) => {
            selectSQL(`SELECT [Funções] FROM [Colaboradores] WHERE [Registro] = ${register}`, (data) => {
                if (!jQuery.isEmptyObject(data) && data[0].Funções.value.includes('A')) {
                    $('.passwordField').fadeIn('slow');
                    $('#inPassword').focus();
                } else {
                    $('.passwordField').fadeOut('slow');
                }
            })
        });
    }

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
                    remote.getGlobal("defs").colaborador.Funções.value = getFunctions();
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

// Funções do colaborador
function getFunctions() {
    let get = remote.getGlobal("defs").colaborador.Funções.value.split('');
    let functions = {
        "E": "Eletricista",
        "M": "Mecânico",
        "P": "Programador",
        "R": "Projetista",
        "A": "Administrativo",
        "N": "Engenheiro"
    };
    let result = [];
    get.forEach(function(e) {
        if (!(e == ' ')) {
            result.push(functions[e]);
        }
    });
    return result;
}