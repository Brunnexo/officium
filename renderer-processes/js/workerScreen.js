// Electron
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

// Extensões internas
const { ColorMode } = require('../../officium-modules/colormode');
const { HTMLLoader } = require('../../officium-modules/cloader');

// Dependências
window.jQuery = window.$ = require('jquery');
require('bootstrap');

// Instâncias
const HTML = new HTMLLoader();

const worker = remote.getGlobal('data').worker;

const { PersonalResume } = require('../../officium-modules/ws-pages');

const Pages = {
    Resume: {
        Personal: new PersonalResume({
            title: '#title',
            registry: worker.Registro.value,
            journey: worker.Jornada.value,
            charts: {
                history: '#history',
                remain: '#graphRemain',
                total: '#graphTotal'
            }
        })
    }
};

// Funções ao carregar a página
$(document).ready(function() {
    // Executa módulo
    HTML.execute();
    // Esquema de cores
    ColorMode(localStorage.getItem('colorMode'));
    // Nome do colaborador
    $('#nav-name').text(worker.Nome.value);
    // Carrega data atual
    document.getElementById("date").valueAsDate = new Date();
    // Carrega inicialmente o resumo pessoal
    HTML.load('personal-resume', () => {
        Pages.Resume.Personal.getData(
            document.getElementById('date').value);
    });
});

// Alteração de data
$("#date").change(function() {
    // Função ao alterar data
    clearTimeout(this.inputDelay);
    this.inputDelay = setTimeout(function() {
        HTML.load('personal-resume', () => {
            Pages.Resume.Personal.getData(
                document.getElementById('date').value);
        });
    }, 500);
});

// Botões de janela
$('.close-btn').click(() => {
    remote.getCurrentWindow().close();
});

// Voltar ao início
$('#home').click(() => {
    ipc.send('back-main');
});

// Abrir preferências
$('#prefs').click(() => {

});

$('.refresh-btn').click(() => {
    remote.getCurrentWindow().reload();
});

// Botões de navegação
$('#nav-personal').click(() => {
    HTML.load('personal-resume', () => {
        Pages.Resume.Personal.getData(
            document.getElementById('date').value);
    });
});