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
const { createCompilerHostFromProjectRootSync } = require('electron-compile');

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

    // Campos dinâmicos
    if ($('.active')[0].id.includes('resume')) {

    } else {
        if ($('#title').html().includes('Projeto')) {
            // Inserção de dados
            //
            // Funções do colaborador
            // Atividades do colaborador
            // Descrição das atividades do colaborador
            // Clientes
            // Projetos
            // WOs

            // Funções do colaborador
            colaborador.Funções.value.forEach(function(f) {
                let index = colaborador.Funções.value.indexOf(f);
                $("#inFunction").append(`<option index="${index}">${f}</option>`);
            });
            let função = $('#inFunction :selected').text();

            // Atividades do colaborador
            Object.keys(activities[função]).forEach(function(val) {
                $("#inActivity").append(`<option>${val}</option>`);
            });

            //Descrição das atividades do colaborador
            let atividade = $('#inActivity :selected').text();
            activities[função][atividade].forEach(function(val) {
                $("#inDescription").append(`<option>${val}</option>`);
            });

            // Clientes
            clients.forEach(function(k) {
                let index = clients.indexOf(k);
                $("#inClient").append(`<option index="${index}">${k}</option>`);
            });

            // Projetos
            projetos.forEach(function(p) {
                let cliente = $('#inClient :selected').text();
                if (p.Cliente.value.includes(cliente)) {
                    $("#inProject").append(`<option index="${p.ID.value}" client="${clients.indexOf(p.Cliente.value)}" proj="${p.Projeto.value}" wo="${p[função].value}">${p.Descrição.value}</option>`);
                }
            });

            // WO
            let wo = $("#inProject :selected").attr('wo');
            if (wo == 'null') {
                $("#inWO").val('');
            } else {
                $("#inWO").val(wo);
            }

            // Alteração dos campos
            //
            // WO
            // Projeto
            // Cliente
            //
            // Função
            // Atividade

            // WO -> Projeto & Cliente
            let inputDelay;
            $("#inWO").keyup(function(e) {
                $("#loading").fadeIn('fast');
                clearTimeout(inputDelay);
                inputDelay = setTimeout(function() {
                    let wo = $("#inWO").val();
                    if (!(isNaN(Number(wo)))) {
                        let hasWO = false;
                        let selClient;
                        projetos.forEach(function(p) {
                            if (p[função].value == wo) {
                                hasWO = true;
                                selClient = p.Cliente.value;
                            }
                        });
                        if (hasWO) {
                            // Remove os projetos da lista atual
                            $("#inProject option").each(function() {
                                $(this).remove();
                            });
                            // Adicionar projetos
                            projetos.forEach(function(p) {
                                if (p.Cliente.value.includes(selClient)) {
                                    $("#inProject").append(`<option index="${p.ID.value}" client="${clients.indexOf(p.Cliente.value)}" proj="${p.Projeto.value}" wo="${p[função].value}">${p.Descrição.value}</option>`);
                                }
                            });
                            $(`#inProject option[wo=${wo}]`).prop("selected", true);
                            $(`#inClient [index=${$("#inProject :selected").attr("client")}]`).prop("selected", true);
                        }
                    }
                    $("#loading").fadeOut('fast');
                }, 500);
            });

            // Projeto -> WO
            $("#inProject").change(function() {
                let wo = $("#inProject :selected").attr('wo');
                if (wo == 'null') {
                    $("#inWO").val('');
                } else {
                    $("#inWO").val(wo);
                }
            });

            // Cliente -> Projeto && WO
            $("#inClient").change(function() {
                // Remove projetos da lista
                $("#inProject option").each(function() {
                    $(this).remove();
                })

                // Adiciona projetos do cliente selecionado na lista
                projetos.forEach(function(p) {
                    if (p.Cliente.value.includes($("#inClient").val())) {
                        $("#inProject").append(`<option index="${p.ID.value}" client="${clients.indexOf(p.Cliente.value)}" proj="${p.Projeto.value}" wo="${p[função].value}">${p.Descrição.value}</option>`);
                    }
                });

                // WO do projeto selecionado
                let wo = $("#inProject :selected").attr('wo');
                if (wo == 'null') {
                    $("#inWO").val('');
                } else {
                    $("#inWO").val(wo);
                }
            });

            // Função -> tudo
            $("#inFunction").change(function() {
                let função = $('#inFunction :selected').text();

                // Atividades do colaborador
                // Remove as atividades atuais na lista
                $("#inActivity option").each(function() {
                    $(this).remove();
                });

                // Adiciona atividades na lista
                Object.keys(activities[função]).forEach(function(val) {
                    $("#inActivity").append(`<option>${val}</option>`);
                });

                // Descrição das atividades do colaborador
                // Remove as descrições da lista
                $("#inDescription option").each(function() {
                    $(this).remove();
                });
                let atividade = $('#inActivity :selected').text();

                // Adiciona as atividades
                activities[função][atividade].forEach(function(val) {
                    $("#inDescription").append(`<option>${val}</option>`);
                });

                // Projetos
                // Remove os projetos atuais (WO da antiga função selecionada)
                $("#inProject option").each(function() {
                    $(this).remove();
                });

                // Adicionar projetos na lista
                projetos.forEach(function(p) {
                    let cliente = $('#inClient :selected').text();
                    if (p.Cliente.value.includes(cliente)) {
                        $("#inProject").append(`<option index="${p.ID.value}" client="${clients.indexOf(p.Cliente.value)}" proj="${p.Projeto.value}" wo="${p[função].value}">${p.Descrição.value}</option>`);
                    }
                });

                // WO
                let wo = $("#inProject :selected").attr('wo');
                if (wo == 'null') {
                    $("#inWO").val('');
                } else {
                    $("#inWO").val(wo);
                }
            });

            // Atividade -> descrição
            $("#inActivity").change(function() {
                let atividade = $('#inActivity :selected').text();
                let função = $('#inFunction :selected').text();
                // Remove as descrições atuais
                $("#inDescription option").each(function() {
                    $(this).remove();
                });
                // Adiciona as novas descrições na lista
                activities[função][atividade].forEach(function(val) {
                    $("#inDescription").append(`<option>${val}</option>`);
                });
            });

        } else if ($('#title').html().includes('Service Request')) {
            // Alterações de campo
            let inputDelay;

            // WO
            $("#inWO").keyup(function(e) {
                $("#loading").fadeIn('fast');
                clearTimeout(inputDelay);
                inputDelay = setTimeout(function() {
                    let wo = $("#inWO").val();
                    if (!(isNaN(Number(wo)))) {
                        srs.forEach(function(s) {
                            if (s.WO.value == wo) {
                                $("#inSR").val(s.SR.value);
                                $("#inService").val(s.Descrição.value);
                            }
                        });
                    } else {
                        $("#inSR").val('');
                        $("#inService").val('');
                    }
                    $("#loading").fadeOut('fast');
                }, 500);
            });

            // SR
            $("#inSR").keyup(function(e) {
                $("#loading").fadeIn('fast');
                clearTimeout(inputDelay);
                inputDelay = setTimeout(function() {
                    let sr = $("#inSR").val();
                    if (!(isNaN(Number(sr)))) {
                        srs.forEach(function(s) {
                            if (s.SR.value == sr) {
                                $("#inWO").val(s.WO.value);
                                $("#inService").val(s.Descrição.value);
                            }
                        });
                    } else {
                        $("#inWO").val('');
                        $("#inService").val('');
                    }
                    $("#loading").fadeOut('fast');
                }, 500);
            });

        } else {

        }
    }

    // Mostrar conteúdo da página
    content.fadeIn('slow');
    $("#loading").fadeOut('slow');
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