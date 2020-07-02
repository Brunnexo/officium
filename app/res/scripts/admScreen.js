// Electron
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

// Dependências
window.jQuery = window.$ = require('jquery');
const Popper = require('@popperjs/core');
require('bootstrap');
const fs = require('fs');
const Chart = require('chart.js');

// Constantes
const content = $("#content");
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;

// Variáveis JSON
const clients = JSON.parse(fs.readFileSync(`${__dirname}/datas/clients.json`, 'utf-8'));
const activities = JSON.parse(fs.readFileSync(`${__dirname}/datas/activities.json`, 'utf-8'));

// Variáveis de página
const pageResume = getInnerHtml('Resume');
const pageWorkersResume = getInnerHtml('WorkersResume');
const pageProject = getInnerHtml('Project');
const pageSr = getInnerHtml('SR');
const pageGeneral = getInnerHtml('General');

// Variáveis globais
const colaborador = remote.getGlobal("defs").colaborador;
const projetos = remote.getGlobal("defs").projetos;
const geral = remote.getGlobal("defs").geral;
const srs = remote.getGlobal("defs").srs;

// Funções ao carregar a página
$(document).ready(function() {
    $("#name").html(remote.getGlobal("defs").colaborador.Nome.value);
    document.getElementById("inDate").valueAsDate = new Date();
    loadHTML(pageResume);

    // Ativa balões de dicas
    $(function() {
        $('[data-toggle="tooltip"]').tooltip();
    });

});

// Ação do botão "fechar"
$("#close").click(function() {
    remote.getCurrentWindow().close();
});

// Ação do botão "voltar"
$("#back").click(function() {
    ipc.send('back-from-admScreen');
});

// Ação do botão "minimizar"
$("#iconify").click(function() {
    $("#iconify").blur();
    remote.getCurrentWindow().minimize();
});

// Funções ao ter alterações na página
new MutationObserver(() => {
    // Ativa balões de dicas
    $(function() {
        $('[data-toggle="tooltip"]').tooltip();
    });

    // Notificações
    $(".toast").toast({
        animation: true,
        autohide: false,
        delay: 2000
    });
    $(".toast").toast('show');

}).observe(document.getElementById('content'), {
    attributes: true,
    childList: true,
    subtree: true
});

// Ação do botão resumo
$("#personalResume, #everybodyResume").click(function() {
    $(".active").removeClass("active");
    $("#resume").addClass("active");
});

// Projeto
$("#project").click(function() {
    loadHTML(pageProject);
});
// Service Request
$("#sr").click(function() {
    loadHTML(pageSr);
});
// Geral
$("#general").click(function() {
    loadHTML(pageGeneral);
});

// Resumo pessoal
$("#personalResume").click(function() {
    loadHTML(pageResume);
});

// Resumo do setor
$("#everybodyResume").click(function() {
    // loadHTML(pageWorkersResume);
    loadHTML(pageWorkersResume);
});

// Funções
// Carrega o conteúdo da página
function loadHTML(pageHTML) {
    content.hide();
    content.html(pageHTML);
    content.fadeIn('slow');
}

// Retorna WO ou espaço em branco
function getWO() {
    var wo = $("#inProject :selected").attr('wo');
    if (wo == 'null') {
        $("#inWO").val('');
        showErrorLog("Não há WO deste projeto para esta função!");
    } else {
        $("#inWO").val(wo);
    }
}

// Retorna o conteúdo HTML de uma tag com ID
function getInnerHtml(HTML) {
    // __dirname representa o caminho de onde está usando o JS
    var get = fs.readFileSync(`${__dirname}/views/${HTML}.html`, 'utf-8');
    return get;
}

// Formata a data no padrão DD/MM/YYYY
function dateFormat(date, separator = '/') {
    switch (separator) {
        case '/':
            var get = date.split('-');
            return `${get[2]}/${get[1]}/${get[0]}`;
        case '-':
            var get = date.split('/');
            return `${get[2]}-${get[1]}-${get[0]}`;
    }
}

// Mensagem de erros
function showErrorLog(log, id = 'errorLog') {
    $(`#${id}`).hide();
    $(`#${id}`).html(log);
    $(`#${id}`).fadeIn('slow');

    setTimeout(function() {
        $(`#${id}`).fadeOut('slow');
    }, 3000);
}