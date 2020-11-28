// Electron
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

// Extensões internas
const { MSSQL, ColorMode } = require('../../officium-modules/officium');

// Dependências
window.jQuery = window.$ = require('jquery');

const SQL_DRIVER = new MSSQL(remote.getGlobal('sql').config);
const DATA = {
    projects: new Array,
    srs: new Array,
    general: new Array,

    load: async function() {
        $("#description").html('Carregando projetos...');
        await SQL_DRIVER.select(MSSQL.QueryBuilder('Project'), (data) => { DATA.projects.push(data); }).then(() => {
            remote.getGlobal('sql').projects = DATA.projects;
        });
        $("#description").html('Carregando SRs...');
        await SQL_DRIVER.select(MSSQL.QueryBuilder('SRs'), (data) => { DATA.srs.push(data); }).then(() => {
            remote.getGlobal('sql').srs = DATA.srs;
        });
        $("#description").html('Carregando geral...');
        await SQL_DRIVER.select(MSSQL.QueryBuilder('General'), (data) => { DATA.general.push(data); }).then(() => {
            remote.getGlobal('sql').general = DATA.general;
            $("#description").html('Pronto!');
            ipc.send('show-main');
        });
    }
};

$(document).ready(() => {
    let colorMode = localStorage.getItem('colorMode');
    localStorage.setItem('colorMode', colorMode == 'null' ? 'auto' : colorMode);
    ColorMode(localStorage.getItem('colorMode'));

    remote.getCurrentWindow()
        .on('focus', () => {
            document.querySelector('.view').classList.remove('no-focus');
        })
        .on('blur', () => {
            document.querySelector('.view').classList.add('no-focus');
        });

    DATA.load();
});

$('.close-btn').click(() => {
    remote.app.quit();
});