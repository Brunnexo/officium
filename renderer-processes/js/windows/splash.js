// Electron
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;
// Extensões internas



const { MSSQL, ColorMode } = require(`../../../officium-modules/Officium`);

const SQL_DRIVER = new MSSQL();

const DATA = {
    projects: new Array,
    srs: new Array,
    general: new Array,

    async SQL() {
        document.getElementById('description')
            .innerHTML = 'Carregando...';
        await SQL_DRIVER.connect()
            .then(this.load)
            .catch(this.error);
    },
    async load() {
        let description = document.getElementById('description');

        description.innerHTML = 'Carregando projetos...';
        await SQL_DRIVER.select(MSSQL.QueryBuilder('Project'), (data) => {
                DATA.projects.push(data);
            })
            .then(() => {
                remote.getGlobal('sql').projects = DATA.projects;
            });
        description.innerHTML = 'Carregando SRs...';

        await SQL_DRIVER.select(MSSQL.QueryBuilder('SRs'), (data) => {
                DATA.srs.push(data);
            })
            .then(() => {
                remote.getGlobal('sql').srs = DATA.srs;
            });
        description.innerHTML = 'Carregando geral...';
        await SQL_DRIVER.select(MSSQL.QueryBuilder('General'), (data) => {
                DATA.general.push(data);
            })
            .then(() => {
                remote.getGlobal('sql').general = DATA.general;
                description.innerHTML = 'Pronto!';
                ipc.send('show-main');
            });
    },
    error(err) {
        let description = document.getElementById('description');
        description.innerHTML = `<center>Erro: ${err}</center>`;
        setTimeout(() => {
            remote.app.quit();
        }, 5000);
    }
};

window.onload = () => {
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
    DATA.SQL();
}

document.querySelector('.close-btn').parentElement.onclick = () => {
    remote.app.quit();
}