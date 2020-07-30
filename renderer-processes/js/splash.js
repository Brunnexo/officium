const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;
const { MSSQL, queryBuilder } = require('../../officium-modules/sqlutils');

window.jQuery = window.$ = require('jquery');

const SQL_DRIVER = new MSSQL(remote.getGlobal('sql').config);
const DATA = {
    load: async function() {
        $("#description").html('Carregando projetos...');
        await SQL_DRIVER.select(queryBuilder('Project'), (data) => { DATA.projects.push(data); }).then(() => {
            remote.getGlobal('sql').projects = DATA.projects;
        });
        $("#description").html('Carregando SRs...');
        await SQL_DRIVER.select(queryBuilder('SRs'), (data) => { DATA.srs.push(data); }).then(() => {
            remote.getGlobal('sql').srs = DATA.srs;
        });
        $("#description").html('Carregando geral...');
        await SQL_DRIVER.select(queryBuilder('General'), (data) => { DATA.general.push(data); }).then(() => {
            remote.getGlobal('sql').general = DATA.general;
            $("#description").html('Pronto!');
            ipc.send('show-main');
        });
    },

    projects: [],
    srs: [],
    general: []
};

$(document).ready(function() {
    $('body').css('user-select', 'none');
    DATA.load();
});