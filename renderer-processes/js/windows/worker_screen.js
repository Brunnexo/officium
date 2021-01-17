const path = require('path');
// Electron
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

// Extensões internas
const { PageLoader, ColorMode, Charts, WorkerLabor, WorkerManager, MSSQL } = require(path.resolve(__dirname, '../../../officium-modules/Officium'));

// Instâncias
const HTML = new PageLoader();
const SQL_DRIVER = new MSSQL();
// Variáveis globais
const worker = remote.getGlobal('data').worker;
const srs = remote.getGlobal('sql').srs;
const workTime = remote.getGlobal('parameters').workTime;

const charts = new Charts({
    title: 'title',
    historyTable: 'history-table',
    laborChart: 'labor-chart',
    totalChart: 'total-chart',
    extraChart: 'extra-chart',
});

const functions = {
    "E": "Eletricista",
    "M": "Mecânico",
    "P": "Programador",
    "R": "Projetista",
    "A": "Administrativo",
    "N": "Engenheiro"
};
back_page = '';

// Funções ao carregar a página
window.onload = () => {
    ColorMode(localStorage.getItem('colorMode'));

    document.getElementById('nav-name').textContent = worker['Nome'].value;
    document.getElementById("date").valueAsDate = new Date();

    if (worker['Funções'].value.includes('A')) document.getElementById('nav-manage-workers').classList.remove('hidden');

    let color = localStorage.getItem('colorMode');
    document.getElementById('colorMode')
        .getElementsByClassName('name')[0]
        .textContent = (color == 'light' ? 'Tema: claro' : color == 'dark' ? 'Tema: escuro' : 'Tema: auto.');

    remote.getCurrentWindow()
        .on('focus', () => {
            document.querySelector('.view').classList.remove('no-focus');
        })
        .on('blur', () => {
            document.querySelector('.view').classList.add('no-focus');
        });

    WorkerLabor.updateInfo({
        date: document.getElementById("date").value,
        registry: Number(worker.Registro.value),
        journey: worker.Jornada.value,
        workTime: workTime,
    }).onLoad = () => { charts.render(WorkerLabor.info) };

    HTML.load('personal-resume');
}


document.getElementById('date').onchange = () => {
    clearTimeout(this.inputDelay);
    this.inputDelay = setTimeout(() => {
        WorkerLabor.updateInfo({ date: document.getElementById("date").value });
        HTML.update();
    }, 500);
}

// Navegar para o resumo
document.getElementById('nav-resume').onclick = () => {
    document.querySelectorAll('.active').forEach((elmnt) => {
        elmnt.classList.remove('active');
    });
    document.getElementById('nav-resume').classList.add('active');
    HTML.load('personal-resume');
};

// Navegar para o registro
document.getElementById('nav-reg').onclick = () => {
    document.querySelectorAll('.active').forEach((elmnt) => {
        elmnt.classList.remove('active');
    });
    document.getElementById('nav-reg').classList.add('active');
    HTML.load('reg-type');
}

// Gerenciar colaboradores
document.getElementById('nav-manage-workers').onclick = () => {
    document.querySelectorAll('.active').forEach((elmnt) => {
        elmnt.classList.remove('active');
    });
    document.getElementById('nav-manage-workers').classList.add('active');
    HTML.load('manage-workers');
}

// Abrir preferências
document.getElementById('colorMode').onclick = () => {
    let color = localStorage.getItem('colorMode');
    let text = document.getElementById('colorMode').getElementsByClassName('name')[0];
    switch (color) {
        case 'light':
            ColorMode('dark');
            localStorage.setItem('colorMode', 'dark');
            text.textContent = 'Tema: escuro';
            break;
        case 'dark':
            ColorMode('auto');
            localStorage.setItem('colorMode', 'auto');
            text.textContent = 'Tema: auto.';
            break;
        case 'auto':
            ColorMode('light');
            localStorage.setItem('colorMode', 'light');
            text.textContent = 'Tema: claro';
            break;
    }
}

// Voltar ao início
document.getElementById('home').onclick = () => {
    ipc.send('show-main', 'worker_screen');
}

// Botões de janela
document.querySelectorAll('.close-btn')[0].onclick = () => {
    remote.getCurrentWindow().close()
};