// Electron
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

// Dependências
window.jQuery = window.$ = require('jquery');
const Popper = require('@popperjs/core');
require('bootstrap');
const fs = require('fs');
const Chart = require('chart.js');
const { connect } = require('http2');

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
const srs = remote.getGlobal("defs").srs;

// Funções ao carregar a página
$(document).ready(function() {
    $("#name").html(remote.getGlobal("defs").colaborador.Nome.value);
    $("#name").attr({
        "data-toggle": "tooltip",
        "data-placement": "bottom",
        "title": remote.getGlobal("defs").colaborador.Registro.value
    });
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
}).observe(document.getElementById('content'), {
    attributes: true,
    childList: true,
    subtree: true
});

// Ação do botão resumo
$("#resume").click(function() {
    $(".active").removeClass("active");
    $("#resume").addClass("active");
    loadHTML(pageResume);
    getHistory($('#history'));
});

// Eventos de cliques dos menus
$("#project, #sr, #general").click(function() {
    $(".active").removeClass("active");
    $("#registro").addClass("active");
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
// Evento de mudança de data
$("#inDate").change(function() {
    // Função ao alterar data,
    getHistory($('#history'));
});

// Funções
// Histórico do colaborador
function getHistory(div) {
    var SQL = `SELECT
                [ID], [Função], [WO], [Descrição], [Tempo], (CASE WHEN [Extra] <> 0 THEN 'SIM' ELSE 'NÃO' END) AS [Extra] FROM [Relatórios]
                    WHERE [Registro] = ${colaborador.Registro.value}
                        AND [Data] = '${document.getElementById('inDate').value}'`;

    connectSQL(function() {
        selectSQL(SQL, (data) => {
            makeTable(data, div);
        });
    });
}

// Gera a tabela com base no JSON do MSSQL
function makeTable(dados, div) {
    div.hide();

    if (dados.length >= 1) {
        var thead = document.createElement('thead');
        var table = document.createElement('table');
        $(table).addClass('table table-sm');

        thead.innerHTML = `
            <thead>
                <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Função</th>
                    <th scope="col">WO</th>
                    <th scope="col">Descrição</th>
                    <th scope="col">Tempo</th>
                    <th scope="col">Extra</th>
                </tr>
            </thead>`;

        table.appendChild(thead);
        var tbody = document.createElement('tbody');

        dados.forEach(function(arr) {
            // Dados da tabela
            var tr = document.createElement('tr');
            // Conteúdo HTML da tabela
            tr.innerHTML = `
                <th scope="row">${arr.ID.value}</th>
                <th>${arr.Função.value}</th>
                <th>${arr.WO.value}</th>
                <th>${arr.Descrição.value}</th>
                <th>${arr.Tempo.value}</th>
                <th>${arr.Extra.value}</th>`;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        div.html('');
        div.append(table);
        div.fadeIn("slow");

        // Variável de posição do mouse
        let id;

        // Menu
        const menu = new Menu();
        const menuItem = new MenuItem({
            label: 'Apagar',
            click: () => {
                connectSQL(() => {
                    executeSQL("DELETE FROM [Relatórios] WHERE [ID] = " + id, () => {
                        getHistory($("#history"));
                    });
                });
            }
        });
        menu.append(menuItem);
        // Menu de contexto
        $("tbody").contextmenu((e) => {
            // Evita ações padrões
            e.preventDefault();
            id = Number(e.target.parentElement.getElementsByTagName("th")[0].innerHTML);
            menu.popup(remote.getCurrentWindow());
        });
    } else {
        div.html('');
    }
}
// Carrega o conteúdo da página
function loadHTML(pageHTML) {
    content.hide();
    content.html(pageHTML);
    // Mostrar conteúdo da página
    fillFields();
    content.fadeIn('slow');
}
// Preenche campos da página
function fillFields() {
    if ($('.active')[0].id.includes('resume')) {

    } else {
        if ($('#title').html().includes('Projeto')) {
            // Cliente
            clients.forEach(function(k) {
                $("#inClient").append(`<option value="${k}">${k}</option>`);
            });
            // Projetos
            projetos.forEach(function(p) {
                if (p.Cliente.value.includes($('#inClient').find(':selected').text())) {
                    $("#inProject").append(`<option value="${p.ID.value}">${p.Projeto.value} - ${p.Descrição.value}</option>`);
                }
            });
            // Funções do colaborador
            colaborador.Funções.value.forEach(function(f) {
                $("#inFunction").append(`<option>${f}</option>`);
            });
            // Atividades do colaborador
            Object.keys(activities[$('#inFunction').find(':selected').text()]).forEach(function(val) {
                $("#inActivity").append(`<option>${val}</option>`);
            });
            //Descrição das atividades do colaborador
            activities[$('#inFunction').find(':selected').text()][$('#inActivity').find(':selected').text()].forEach(function(val) {
                $("#inDescription").append(`<option>${val}</option>`);
            });
            // WO
            let projeto = $('#inProject').find(':selected').text().split(' - ')[0];
            let descrição = $('#inProject').find(':selected').text().split(' - ');
            descrição = descrição[(descrição.length - 1)];
            projetos.forEach(function(p) {
                if ((p.Projeto.value.includes(projeto)) && (p.Descrição.value.includes(descrição))) {
                    $("#inWO").val(p[$('#inFunction').find(':selected').text()].value);
                }
            });
        } else if ($('#title').html().includes('Service Request')) {

        } else {

        }
    }
}

function makeGraph(id, data, label, type = 'doughnut') {
    let datas = [];
    let labels = [];

    let ctx = document.getElementById(id).getContext('2d');
    let grd = ctx.createRadialGradient(150, 150, 50, 300, 300, 100);
    grd.addColorStop(0, "#f06c00");
    grd.addColorStop(0.3, "#00f014");
    grd.addColorStop(1, "#00e5ff");
    ctx.fillStyle = grd;


    new Chart($(`#${id}`), {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                data: datas,
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

// Retorna o conteúdo HTML de uma tag com ID
function getInnerHtml(HTML) {
    // __dirname representa o caminho de onde está usando o JS
    let get = fs.readFileSync(`${__dirname}/views/${HTML}.html`, 'utf-8');
    return get;
}
// Formata a data no padrão DD/MM/YYYY
function dateFormat(date) {
    let get = date.split('-');
    return `${get[2]}/${get[1]}/${get[0]}`;
}