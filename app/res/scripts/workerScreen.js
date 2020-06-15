// Electron
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

// Dependências
window.jQuery = window.$ = require('jquery');
const Popper = require('@popperjs/core');
require('bootstrap');
const fs = require('fs');

// Constantes
const content = $("#content");
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;

const clients = JSON.parse(fs.readFileSync(`${__dirname}/datas/clients.json`, 'utf-8'));
const activities = JSON.parse(fs.readFileSync(`${__dirname}/datas/activities.json`, 'utf-8'));

// Variáveis de página
const pageProject = getInnerHtml('Project');
const pageSr = getInnerHtml('SR');
const pageGeneral = getInnerHtml('General');

const colaborador = remote.getGlobal("defs").colaborador;
const projetos = remote.getGlobal("defs").projetos;
const srs = remote.getGlobal("defs").srs;

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

// Funções ao carregar a página
$(document).ready(function() {
    $("#name").html(remote.getGlobal("defs").colaborador.Nome.value);
    $("#name").attr({
        "data-toggle": "tooltip",
        "data-placement": "bottom",
        "title": remote.getGlobal("defs").colaborador.Registro.value
    });
    document.getElementById("inDate").valueAsDate = new Date();
});

// Funções ao ter alterações na página
new MutationObserver(() => {
    // Ativa balões de dicas
    $(function() {
        $('[data-toggle="tooltip"]').tooltip();
    });

    // Funções
}).observe(document.getElementById('content'), {
    attributes: true,
    childList: true,
    subtree: true
});

// Ação do botão resumo
$("#resume").click(function() {
    $(".active").removeClass("active");
    $("#resume").addClass("active");
});

// Eventos de cliques dos menus
$("#project, #sr, #general").click(function() {
    $(".active").removeClass("active");
    $("#registro").addClass("active");
});
// Projeto
$("#project").click(function() {
    loadHTML(pageProject, "Projeto");
});
// Service Request
$("#sr").click(function() {
    loadHTML(pageSr, "Service Request");
});
// Geral
$("#general").click(function() {
    loadHTML(pageGeneral, "Geral");
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
        table.setAttribute('class', 'table');

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
        div.html(`<h1 class="display-4">Seu resumo do dia ${dateFormat(document.getElementById('inDate').value)}</h1>`);
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
        div.html(`<h1 class="display-4">Não há dados para mostrar...</h1>`);
        div.fadeIn("slow");
    }
}

function loadHTML(pageHTML, title) {
    content.hide();
    content.html(pageHTML);

    // Scripts por página
    // Todas
    // Projeto
    if (title.includes("Projeto")) {
        // Preenchimento inicial
        // Cliente
        Object.keys(clients).forEach(function(k) {
            $("#inClient").append(`<option>${k}</option>`);
        });
        // Projetos
        projetos.forEach(function(p) {
            if (p.Cliente.value.includes($('#inClient').find(':selected').text())) {
                $("#inProject").append(`<option>${p.Projeto.value} - ${p.Descrição.value}</option>`);
            }
        });
        // Funções do colaborador
        getFunctions().forEach(function(f) {
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
        let descrição = $('#inProject').find(':selected').text().split(' - ')[1];
        projetos.forEach(function(p) {
            if ((p.Projeto.value.includes(projeto)) && (p.Descrição.value.includes(descrição))) {
                $("#inWO").val(p[$('#inFunction').find(':selected').text()].value);
            }
        });
    }

    // Service Request
    if (title.includes("Service Request")) {

    }

    // Geral
    if (title.includes("Geral")) {

    }

    // Mostrar conteúdo da página
    content.fadeIn('slow');
    getHistory($('#history'));
}

// Retorna o conteúdo HTML de uma tag com ID
function getInnerHtml(HTML) {
    // __dirname representa o caminho de onde está usando o JS
    let get = fs.readFileSync(`${__dirname}/views/${HTML}.html`, 'utf-8');
    return get;
}

// Formata a data no padrão brasileiro
function dateFormat(date) {
    let get = date.split('-');
    return `${get[2]}/${get[1]}/${get[0]}`;
}

function getFunctions() {
    let get = colaborador.Funções.value.split('');
    let functions = {
        "E": "Eletricista",
        "M": "Mecânico",
        "P": "Programador",
        "R": "Projetista",
        "A": "Administrativo",
        "N": "Engenheiro"
    };
    let result = [];
    get.forEach(function(e) {
        if (!(e == ' ')) {
            result.push(functions[e]);
        }
    });
    return result;
}