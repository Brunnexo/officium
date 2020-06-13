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
const history = $("#history");

// Variáveis de página
const pageProject = getInnerHtml('Project');
const pageSr = getInnerHtml('SR');
const pageGeneral = getInnerHtml('General');


var montadoras = [
    "General Motors",
    "Volkswagen",
    "Ford",
    "FCA",
    "Renault",
    "Honda",
    "Nissan",
    "Toyota",
    "Hyundai",
    "Mercedes",
    "PSA",
    "MAN",
];

var colaborador = remote.getGlobal("defs").colaborador;

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
    $("#nome").html(remote.getGlobal("defs").colaborador.Nome.value);
    $("#nome").attr({
        "data-toggle": "tooltip",
        "data-placement": "bottom",
        "title": remote.getGlobal("defs").colaborador.Registro.value,
        "style": "-webkit-app-region: no-drag"
    });

    document.getElementById("inDate").valueAsDate = new Date();

    getHistory(history);
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
    getHistory(history);
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
    // Função ao alterar data
    getHistory(history);
});

// Funções
// Histórico do colaborador
function getHistory(div) {
    var SQL = `SELECT TOP(6)
                [ID], [Função], [WO], [Descrição], [Tempo], [Extra] FROM [Relatórios]
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
                <th>${convBoolean(arr.Extra.value)}</th>`;

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
                        getHistory(content);
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
    }

    function convBoolean(a) {
        if (a == true) {
            return "SIM";
        } else {
            return "NÃO";
        }
    }
}

function loadHTML(pageHTML, title) {
    content.hide();
    content.html(pageHTML);

    // Scripts por página
    // Projeto
    if (title.includes("Projeto")) {
        for (a = 0; a < montadoras.length; a++) {
            $("#inClient").append(`<option value='${a}'>${montadoras[a]}</option>`);
        }

        $("#inClient").change(function() {
            // Seleção de montadora alterada
            console.log($(this).find(':selected').attr('value'));
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
}

// Retorna o conteúdo HTML de uma tag com ID
function getInnerHtml(HTML) {
    var get = fs.readFileSync(`${__dirname}\\views\\${HTML}.html`, 'utf-8');
    console.log("[GetInnerHtml]: " + get);
    return get;
}

/*
var <CanvasDocumentElement> = document.getElementById('canvas id');
var variavel = new Chart(<CanvasDocumentElement>, {
    type: 'doughnut', //Tipo do gráfico
    data: {
        labels: ['A', 'B'], // Etiquetas
        datasets: [{
            label: 'ABC', // Título
            data: [1, 2], // Valores
            backgroundColor: [ // Cores de fundo para cada dado (em RGBA)
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)'
            ],
            borderColor: [ // Cores das bordas de cada dado (em RGBA)
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)'
            ],
            borderWidth: 1 // Largura das bordas
        }]
    },
    options: {} // Opções (via DOCUMENTAÇÃO)
});
*/