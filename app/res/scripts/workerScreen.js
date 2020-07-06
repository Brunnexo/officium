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
const pageProject = getInnerHtml('Project');
const pageSr = getInnerHtml('SR');
const pageGeneral = getInnerHtml('General');

// Variáveis globais
const colaborador = remote.getGlobal("defs").colaborador;
const projetos = remote.getGlobal("defs").projetos;
const geral = remote.getGlobal("defs").geral;
const srs = remote.getGlobal("defs").srs;

// Tempos máximos
const maxTimeH = 528;
const maxTimeM = 522;
const maxExtraTime = 60;

// Funções ao carregar a página
$(document).ready(function() {
    $("#name").html(remote.getGlobal("defs").colaborador.Nome.value);
    $("#navToggle").click(() => { toggleSidenav() });

    document.getElementById("inDate").valueAsDate = new Date();
    loadHTML(pageResume, 'Resume');

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
    ipc.send('back-from-workerScreen');
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
$("#resume").click(function() {
    $(".active").removeClass("active");
    $("#resume").addClass("active");
    loadHTML(pageResume, 'Resume');
});

// Eventos de cliques dos menus
$("#project, #sr, #general").click(function() {
    $(".active").removeClass("active");
    $("#registro").addClass("active");
});
// Projeto
$("#project").click(function() {
    loadHTML(pageProject, 'Project');
});
// Service Request
$("#sr").click(function() {
    loadHTML(pageSr, 'SR');
});
// Geral
$("#general").click(function() {
    loadHTML(pageGeneral, 'General');
});

// Funções
// Carrega o conteúdo da página
function loadHTML(pageHTML, script) {
    content.hide();
    content.html(pageHTML);
    // Mostrar conteúdo da página
    content.fadeIn('slow');
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

// Alterna a barra lateral
function toggleSidenav(val = 'toggle') {
    switch (val) {
        case 'toggle':
            $(".sidenav, .pagecontainer, .tablecontainer").toggleClass("active");
            break;
        case 'active':
            $(".sidenav, .pagecontainer, .tablecontainer").addClass("active");
            break;
        case 'inactive':
            $(".sidenav, .pagecontainer, .tablecontainer").removeClass("active");
    }
}

// Teste
function popNotify(title, date, body) {
    let id = ($("#notifications .navitem").length + 1);
    let navInject = `<div class="navitem" id="id${id}">
                        <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                            <div class="toast-header">
                                <strong class="mr-auto">${title}</strong>
                                <small class="text-muted">${date}</small>
                                <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Fechar">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            </div>
                            <div class="toast-body">
                                ${body}
                            </div>
                        </div>
                    </div>`;
    $("#notifications").append(navInject);

    var notifCheck = function() {
        if ($("#notifications .navitem").length > 0 && ($(".notifPop").hasClass("show") == false)) {
            $(".notifPop").addClass("show");

            new Notification('Officium', {
                body: "Você tem novas notificações!",
            }).onclick = () => {
                remote.getCurrentWindow().focus();
                $('.sidenav, .pagecontainer').addClass('active');
            };

        } else if ($("#notifications .navitem").length == 0) {
            $(".notifPop").removeClass("show");
        }
    };

    notifCheck();

    $(`.navitem#id${id}`).on('hidden.bs.toast', function() {
        this.remove();
        notifCheck();
    });


}

$("#btn").click(function() {
    popNotify("Teste", "03/07/2020", "Atrasou!");

    // Notificações
    $(".toast").toast({
        animation: true,
        autohide: false,
        delay: 2000
    });
    $(".toast").toast('show');
});