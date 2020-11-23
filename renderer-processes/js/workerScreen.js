// Electron
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

// Extensões internas
const { PageLoader, ColorMode, PersonalResume } = require('../../officium-modules/officium');

// Dependências
window.jQuery = window.$ = require('jquery');
require('bootstrap');

// Instâncias
const HTML = new PageLoader();
// Variáveis remotas globais

const worker = remote.getGlobal('data').worker;
const srs = remote.getGlobal('sql').srs;
// Funções ao carregar a página

window.onload = () => {
    // Esquema de cores
    ColorMode(localStorage.getItem('colorMode'));
    // Nome do colaborador
    $('#nav-name').text(worker.Nome.value);
    // Carrega data atual
    document.getElementById("date").valueAsDate = new Date('06-11-2020');
    // Carrega inicialmente o resumo pessoal
    HTML.load('personal-resume');
}

document.getElementById('date').onchange = () => {
    clearTimeout(this.inputDelay);
    this.inputDelay = setTimeout(() => {
        HTML.load('personal-resume');
    }, 500);
}

// Navegar para o resumo
$('#nav-resume').click(() => {
    //Pages.load('personal-resume');
    $('.active').removeClass('active');
    $('#nav-resume').addClass('active');
});

// Navegar para o registro
document.getElementById('nav-reg').onclick = () => {
    HTML.load('reg-service');
}

// Abrir preferências
document.getElementById('prefs').onclick = () => {
    ipc.send('open-preferences');
}

// Voltar ao início
document.getElementById('home').onclick = () => {
    ipc.send('back-main');
}

// Botões de janela
document.querySelectorAll('.close-btn').forEach((elmnt, key) => {
    elmnt.parentElement.onclick = () => { remote.getCurrentWindow().close() }
});