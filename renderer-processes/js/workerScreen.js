// Electron
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

// Extensões internas
const { MSSQL, QueryBuilder } = require('../../officium-modules/sqlutils');
const { ColorMode } = require('../../officium-modules/colormode');
const { HTMLLoader } = require('../../officium-modules/cloader');

// Dependências
window.jQuery = window.$ = require('jquery');
require('bootstrap');

// Instâncias
const SQL_DRIVER = new MSSQL(remote.getGlobal('sql').config);
const HTML = new HTMLLoader();

const

const WORKER = {
    name: remote.getGlobal('data').worker.Nome.value,
    registry: remote.getGlobal('data').worker.Registro.value,
    functions: remote.getGlobal('data').worker.Funções.value,
    journey: remote.getGlobal('data').worker.Jornada.value
};

const { PersonalResume } = require('../../officium-modules/ws-pages');



var personalResume;




// Funções ao carregar a página
$(document).ready(function() {
    // Esquema de cores
    ColorMode(localStorage.getItem('colorMode'));
    // Nome do colaborador
    $('#nav-name').text(WORKER.name);
    // Carrega inicialmente o resumo pessoal
    HTML.load('personal-resume', () => {
        personalResume = new pResume({
            title: $('#title'),
            name: WORKER.name,
            registry: WORKER.registry,
            charts: {
                history: $('#history'),
                remain: $('#graphRemain'),
                total: $('#graphTotal')
            }
        });
        personalResume.getData('2020-06-11');
    });
});

// Botões de janela
$('.close-btn').click(() => {
    remote.getCurrentWindow().close();
});

// Voltar ao início
$('#home').click(() => {
    ipc.send('back-main');
});

// Abrir preferências
$('#prefs').click(() => {

});

$('.refresh-btn').click(() => {
    remote.getCurrentWindow().reload();
});

// Botões de navegação
$('#nav-personal').click(() => {
    HTML.load('personal-resume', () => {
        personalResume.getData('2020-06-11');
    });
});

/* Classes para tela do colaborador */

class Personal {
    constructor(info) {
        this.title = info.title;
        this.name = info.name;
        this.registry = info.registry;
        this.charts = {
            history: info.charts.history,
            remain: info.charts.remain,
            total: info.charts.total
        };
        this.resume = [];
        this.remain = [];
        this.total = [];
    }

    async getData(date) {
        await SQL_DRIVER.select(
            queryBuilder('History', this.registry, date),
            (data) => {
                this.resume.push(data);
            }
        ).then(() => {
            this.charts.history.hide();
            this.title.hide();

            this.title.html(`Resumo de ${dateFormat(date)}`);
            this.title.append(`<hr>`);
            this.title.fadeIn('slow');

            if (!$.isEmptyObject(this.resume)) {
                var thead = document.createElement('thead');
                var table = document.createElement('table');

                $(table).addClass(`table`);

                $(thead).html(`
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Função</th>
                        <th scope="col">WO</th>
                        <th scope="col">Descrição</th>
                        <th scope="col">Tempo</th>
                        <th scope="col">Extra</th>
                    </tr>
                </thead>`);

                table.appendChild(thead);
                var tbody = document.createElement('tbody');

                this.resume.forEach((arr) => {
                    // Dados da tabela
                    var tr = document.createElement('tr');
                    // Conteúdo HTML da tabela
                    $(tr).html(`
                        <th scope="row">${arr.ID.value}</th>
                        <th>${arr.Função.value}</th>
                        <th>${arr.WO.value}</th>
                        <th>${arr.Descrição.value}</th>
                        <th>${arr.Tempo.value}</th>
                        <th>${arr.Extra.value}</th>`);
                    tbody.appendChild(tr);
                });
                table.appendChild(tbody);

                this.charts.history.html('');
                this.charts.history.append(table);
                this.charts.history.fadeIn('slow');

            } else {
                this.charts.history.html('<h5 class="display-4 text-center">Não há registros para mostrar...</h5>');
                this.charts.history.fadeIn('slow');
            }
            /*
                Adicionar menu de contexto para apagar linhas
                aqui
            */
            var id, elmnt;
            // Menu
            const menu = new Menu();
            const menuItem = new MenuItem({
                label: 'Apagar',
                click: () => {
                    SQL_DRIVER.execute(`DELETE FROM [Relatórios] WHERE [ID] = ${id}`)
                        .then(
                            $(elmnt).fadeOut('slow')
                        );
                }
            });
            menu.append(menuItem);

            // Menu de contexto
            $("tbody").contextmenu((e) => {
                // Evita ações padrões
                e.preventDefault();
                id = Number(e.target.parentElement.getElementsByTagName("th")[0].innerHTML);
                elmnt = e.target.parentElement;
                menu.popup(remote.getCurrentWindow());
            });
        });

        await SQL_DRIVER.select(
            queryBuilder('Remain', this.registry, date),
            (data) => {
                this.remain.push(data);
            }
        ).then(() => {
            /*
                Gerar gráfico em pizza para tempo restante
            */
        });
        await SQL_DRIVER.select(
            queryBuilder('Total', this.registry),
            (data) => {
                this.total.push(data);
            }
        ).then(() => {
            /*
                Gerar gráfico em pizza para tempo total
            */
        });
    }
}