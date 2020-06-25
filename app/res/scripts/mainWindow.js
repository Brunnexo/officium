const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;
const Tray = require('electron');

// Dependências
window.jQuery = window.$ = require('jquery');
const Popper = require('@popperjs/core');
require('bootstrap');

// Variáveis
// Atraso de consulta para input
var delayInput;

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


// Apaga os dados ao digitar uma letra
$("#inRegister").keydown(function() {
    remote.getGlobal("defs").colaborador = {};
});

// Atualização ao digitar no campo de registro
$("#inRegister").keyup(function(e) {
    // Limpa o timeOut, se tiver
    clearTimeout(delayInput);
    // Timeout, atrasa a consulta em meio segundo
    delayInput = setTimeout(function() {
        let register = $("#inRegister").val();
        if (!(register === null || register === '') && !(e.keyCode == 9) && !(e.keyCode == 16)) {
            connectSQL((e) => {
                selectSQL(`SELECT [Nome], [Registro], [Funções], [Jornada] FROM [Colaboradores] WHERE [Registro] = ${register}`, (data) => {
                    if (!jQuery.isEmptyObject(data)) {
                        remote.getGlobal("defs").colaborador = data[0];
                        remote.getGlobal("defs").colaborador.Funções.value = getFunctions();
                    }
                    if (!jQuery.isEmptyObject(data) && data[0].Funções.value.includes('A')) {
                        $('.passwordField').fadeIn('slow');
                        $('#inPassword').focus();
                    } else {
                        $('.passwordField').fadeOut('slow');
                    }
                })
            });
        }
    }, 500);
});

// Ação do botão "Entrar"
$("#btnEnter").click(function() {
    if (jQuery.isEmptyObject(remote.getGlobal("defs").colaborador)) {
        connectSQL((e) => {
            if (!e) {
                new window.Notification('Joyson GMO', {
                    body: "Erro de conexão com o servidor!",
                }).onclick = () => {
                    remote.getCurrentWindow().focus();
                };
            } else {
                selectSQL(`SELECT [Nome], [Registro], [Funções], [Jornada] FROM [Colaboradores] WHERE [Registro] = ${$("#inRegister").val()}`, (data) => {
                    if (jQuery.isEmptyObject(data)) {
                        setWarning();
                        console.log("[mainWindow]: Colaborador não registrado/encontrado!");
                    } else {
                        remote.getGlobal("defs").colaborador = data[0];
                        remote.getGlobal("defs").colaborador.Funções.value = getFunctions();
                        ipc.send('open-workerScreen');
                    }
                });
            }
        });
    } else {
        ipc.send('open-workerScreen');
    }
});

// Ação do botão "Administrativo"
$("#btnAdm").click(function() {
    connectSQL(() => {
        selectSQL(`SELECT  CASE
                    WHEN [Senha] = HASHBYTES('sha2_512', '${$("#inPassword").val()}') AND [Registro] = ${$("#inRegister").val()}
                    THEN 'TRUE'
                    ELSE 'FALSE'
                    END AS [Autenticado]
                        FROM [SAT].[dbo].[Logins]`, (data) => {
            console.log(Boolean(data[0].Autenticado.value));
            if ("TRUE" == data[0].Autenticado.value) {
                selectSQL(`SELECT [Nome], [Registro], [Funções], [Jornada] FROM [Colaboradores] WHERE [Registro] = ${$("#inRegister").val()}`, (data) => {
                    if (jQuery.isEmptyObject(data)) {
                        setWarning();
                        console.log("[mainWindow]: Colaborador não registrado/encontrado!");
                    } else {
                        remote.getGlobal("defs").colaborador = data[0];
                        remote.getGlobal("defs").colaborador.Funções.value = getFunctions();
                        ipc.send('open-admScreen');
                    }
                });
            } else {
                setWarning('inPassword');
            }
        });
    });
});

// Ação do botão físico "Enter" - Entrar
$('#inRegister').keypress(function(e) {
    if (e.keyCode === 13) {
        e.preventDefault();
        $("#btnEnter").click();
    }
});

// Ação do botão físico "Enter" - Administrativo
$('#inPassword').keypress(function(e) {
    if (e.keyCode === 13) {
        e.preventDefault();
        $("#btnAdm").click();
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

// Altera o campo de texto para cor de "aviso"
function setWarning(id = 'inRegister') {
    $(`#${id}`).toggleClass("bg-danger text-white");
    setTimeout(function() {
        $(`#${id}`).toggleClass("bg-danger text-white");
    }, 2000);
}