const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

const Menu = remote.Menu;
const MenuItem = remote.MenuItem;

const Chart = require('chart.js');

const { MSSQL, queryBuilder } = require('../../officium-modules/sqlutils');
const SQL_DRIVER = new MSSQL(remote.getGlobal('sql').config);

const { HTMLLoader } = require('../../officium-modules/cloader');
const HTML = new HTMLLoader();

const { Pages } = require('../../officium-modules/pages');
const officiumPages = new Pages();

const WORKER = {
    name: remote.getGlobal('data').worker.Nome.value,
    register: remote.getGlobal('data').worker.Registro.value,
    functions: remote.getGlobal('data').worker.Funções.value,
    journey: remote.getGlobal('data').worker.Jornada.value
};

// Dependências
window.jQuery = window.$ = require('jquery');
require('bootstrap');

// Funções ao carregar a página
$(document).ready(function() {
    $('body').css('user-select', 'none');
    $('.navbar').css('-webkit-app-region', 'drag');
    $('.navbar-nav, .navbar-brand, #date, #home').css('-webkit-app-region', 'no-drag');

    // Definir data
    document.getElementById("date").valueAsDate = new Date();
    // Definir nome do colaborador
    $('#nav-name').html(WORKER.name);
    // Checa se usuário é administrativo
    ipc.send('adm-request');
    // Ativa balões de dicas
    $(function() {
        $('[data-toggle="tooltip"]').tooltip();
    });
    // Carregar conteúdo
    HTML.load('register-general',
        officiumPages.General.loadScript);
});

$('#home').click(() => {
    ipc.send('back-to-main');
});

$('#nav-project, #nav-sr, #nav-general').click(() => {
    $('.active').removeClass('active');
    $('#nav-register').addClass('active');
});
$('#nav-project').click(() => {
    HTML.load('register-project',
        officiumPages.Projects.loadScript);
});
$('#nav-sr').click(() => {
    HTML.load('register-srs');
});
$('#nav-general').click(() => {
    HTML.load('register-general',
        officiumPages.General.loadScript);
});

$('#nav-personal, #nav-adm').click(() => {
    $('.active').removeClass('active');
    $('#nav-resume').addClass('active');
});
$('#nav-personal').click(() => {
    HTML.load('personal-resume');
});
$('#nav-adm').click(() => {
    HTML.load('adm-resume');
});

$('#nav-manage-workers').click(() => {
    $('.active').removeClass('active');
    $('#nav-manage-workers').addClass('active');
});

// Carrega menus administrativos
ipc.on('adm-worker', (evt, arg) => {
    if (arg) $('#nav-manage-workers, #nav-adm').show();
});

// Funções ao ter alterações na página
new MutationObserver(() => {
    // Ativa balões de dicas
    $(function() {
        $('[data-toggle="tooltip"]').tooltip();
    });
    // Notificações
    $('.toast').toast({
        animation: true,
        autohide: false,
        delay: 2000
    });
    // Mostrar notificações
    $('.toast').toast('show');
}).observe(document, {
    attributes: true,
    childList: true,
    subtree: true
});