// Electron
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

// Extensões internas
const { MSSQL, QueryBuilder } = require('../../officium-modules/sqlutils/');
const { ColorMode } = require('../../officium-modules/colormode');

// Dependências
window.jQuery = window.$ = require('jquery');

const SQL_DRIVER = new MSSQL(remote.getGlobal('sql').config);
const DATA = {
    projects: new Array,
    srs: new Array,
    general: new Array,

    load: async function() {
        $("#description").html('Carregando projetos...');
        await SQL_DRIVER.select(QueryBuilder('Project'), (data) => { DATA.projects.push(data); }).then(() => {
            remote.getGlobal('sql').projects = DATA.projects;
        });
        $("#description").html('Carregando SRs...');
        await SQL_DRIVER.select(QueryBuilder('SRs'), (data) => { DATA.srs.push(data); }).then(() => {
            remote.getGlobal('sql').srs = DATA.srs;
        });
        $("#description").html('Carregando geral...');
        await SQL_DRIVER.select(QueryBuilder('General'), (data) => { DATA.general.push(data); }).then(() => {
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
    DATA.load();
});

$('.close-btn').click(() => {
    remote.app.quit();
});