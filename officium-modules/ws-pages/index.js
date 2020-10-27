const Menu = remote.Menu;
const MenuItem = remote.MenuItem;

const { MSSQL, queryBuilder } = require('../sqlutils');
const SQL_DRIVER = new MSSQL(remote.getGlobal('sql').config);

class PersonalResume {
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

class Workers {
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
}

function dateFormat(date, separator = '/') {
    switch (separator) {
        case '/':
            var get = date.split('-');
            return `${get[2]}/${get[1]}/${get[0]}`;
        case '-':
            var get = date.split('/');
            return `${get[2]}-${get[1]}-${get[0]}`;
    }
}

module.exports = {
    PersonalResume: PersonalResume
}