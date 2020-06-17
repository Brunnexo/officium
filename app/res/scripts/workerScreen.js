// Electron
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

// Dependências
window.jQuery = window.$ = require('jquery');
const Popper = require('@popperjs/core');
require('bootstrap');
const fs = require('fs');
const Chart = require('chart.js');
const { isNumber } = require('util');

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
    // Preencher com dados
    fillFields();
    // Eventos de alteração de campos
    fieldsChanged();
    // Mostrar conteúdo da página
    content.fadeIn('slow');
}
// Preenche campos da página
function fillFields() {
    if ($('.active')[0].id.includes('resume')) {

    } else {
        if ($('#title').html().includes('Projeto')) {
            // Funções do colaborador
            colaborador.Funções.value.forEach(function(f) {
                let index = colaborador.Funções.value.indexOf(f);
                $("#inFunction").append(`<option value="${index}">${f}</option>`);
            });
            // let função = $('#inFunction').find(':selected').text();
            let função = $('#inFunction :selected').text();

            // Cliente
            clients.forEach(function(k) {
                let index = clients.indexOf(k);
                $("#inClient").append(`<option value="${index}">${k}</option>`);
            });

            // Projetos e WO
            let wo = [];
            projetos.forEach(function(p) {
                // let cliente = $('#inClient').find(':selected').text();
                let cliente = $('#inClient :selected').text();
                if (p.Cliente.value.includes(cliente)) {
                    $("#inProject").append(`<option value="${p.ID.value}">${p.Descrição.value}</option>`);
                    wo.push(p[função].value);
                }
            });
            $("#inWO").val(wo[0]);

            // Atividades do colaborador
            Object.keys(activities[função]).forEach(function(val) {
                $("#inActivity").append(`<option value="${Object.keys(activities[função]).indexOf(val)}">${val}</option>`);
            });

            //Descrição das atividades do colaborador
            // let atividade = $('#inActivity').find(':selected').text();
            let atividade = $('#inActivity :selected').text();
            activities[função][atividade].forEach(function(val) {
                $("#inDescription").append(`<option>${val}</option>`);
            });

        } else if ($('#title').html().includes('Service Request')) {

        } else {

        }
    }
}

// Função para alterações de campo
function fieldsChanged() {
    let delayInput;

    // Remover tempo negativo
    $("#inTime").change(function() {
        let num = Number($(this).val());
        if (num < 0) {
            $(this).val((num * -1));
        }
    });


    if ($('.active')[0].id.includes('resume')) {

    } else {
        if ($('#title').html().includes('Projeto')) {

            // Alteração de WO
            $("#inWO").keyup(function() {
                console.log("KEYUP");
                // let função = $('#inFunction').find(':selected').text();
                let função = $('#inFunction :selected').text();
                let wo = $("#inWO").val();
                if (!(wo.length < 2) && !isNaN(Number(wo))) {
                    // Limpa timeout, se houver
                    clearTimeout(delayInput);
                    // Atraso para validar entrada
                    console.log("TIMEOUT");
                    delayInput = setTimeout(function() {
                        // Altera o cliente conforme WO
                        let selCliente = $("#inClient :selected").text();
                        projetos.forEach(function(p) {
                            let index = clients.indexOf(p.Cliente.value);
                            let id;

                            // Se encontrada  a WO
                            if (p[função].value == wo) {
                                // Seleciona o ID
                                id = p.ID.value;

                                // Seleciona o cliente com base na WO
                                $(`#inClient :selected`).removeAttr('selected');
                                $(`#inClient option[value=${index}]`).attr('selected', 'selected');

                                // Altera a lista de projetos caso haja alteração de cliente
                                if (selCliente != $("#inClient :selected").text()) {
                                    $("#inProject option").each(function() {
                                        $(this).remove();
                                    });
                                    projetos.forEach(function(p) {
                                        let cliente = $('#inClient :selected').text();
                                        if (p.Cliente.value.includes(cliente)) {
                                            $("#inProject").append(`<option value="${p.ID.value}">${p.Descrição.value}</option>`);
                                        }
                                    });
                                }
                                console.log("SELECT");
                                $(`#inProject`).find(':selected').removeAttr('selected');
                                console.log("ID: " + id);
                                $(`#inProject option[value=${id}]`).attr('selected', 'selected');
                            }
                        });
                    }, 500);
                }
            });

            // Alteração da montadora
            $("#inClient").change(function() {
                let wo = [];
                let função = $('#inFunction :selected').text();
                // Remove os projetos da lista
                $("#inProject option").each(function() {
                    $(this).remove();
                });
                // Adiciona os projetos da montadora selecionada
                projetos.forEach(function(p) {
                    // let cliente = $('#inClient').find(':selected').text();
                    let cliente = $('#inClient :selected').text();
                    if (p.Cliente.value.includes(cliente)) {
                        $("#inProject").append(`<option value="${p.ID.value}">${p.Descrição.value}</option>`);
                        wo.push(p[função].value);
                    }
                });
                $("#inWO").val(wo[0]);
            });

            // Alteração de projeto
            $("#inProject").change(function() {
                let id = $(this).val();
                let função = $('#inFunction :selected').text();

                // Altera a WO para associar-se ao projeto escolhido
                projetos.forEach(function(p) {
                    if (id == p.ID.value) {
                        $("#inWO").val(p[função].value);
                    }
                });
            });

            // Alteração da função
            $("#inFunction").change(function() {

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