const Menu = remote.Menu;
const MenuItem = remote.MenuItem;

const { MSSQL, QueryBuilder } = require('../sqlutils');
const SQL_DRIVER = new MSSQL(remote.getGlobal('sql').config);

const Chart = require('chart.js');

const maxTimeH = 528,
    maxTimeM = 522;

class PersonalResume {
    constructor(info) {
        this.title = info.title;
        this.registry = info.registry;
        this.journey = info.journey;
        this.charts = {
            history: info.charts.history,
            remain: info.charts.remain,
            total: info.charts.total
        };
    }

    async getData(date) {
        this.resume = new Array;
        this.remain = new Array;
        this.total = new Array;

        await SQL_DRIVER.select(
            QueryBuilder('History', this.registry, date),
            (data) => {
                this.resume.push(data);
            }
        ).then(() => {
            $(this.charts.history).hide();
            $(this.title).hide()
                .html(`Resumo de ${dateFormat(date)}`)
                .append(`<hr>`)
                .fadeIn('slow');

            if (!$.isEmptyObject(this.resume)) {
                var thead = document.createElement('thead');
                var table = document.createElement('table');

                $(table).addClass(`table`);

                $().html(`
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
                // thead.innerHTML = `
                // `;

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

                $(this.charts.history).html('')
                    .append(table)
                    .fadeIn('slow');

            } else {
                $(this.charts.history).html('<h5 class="display-4 text-center">Não há registros para mostrar...</h5>')
                    .fadeIn('slow');
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
            QueryBuilder('Remain', this.registry, date),
            (data) => {
                this.remain.push(data);
            }
        ).then(() => {
            /*
                Gerar gráfico em pizza para tempo restante
            */
            $(this.charts.remain).hide();

            let times = new Array;
            let projects = new Array;
            let remain = 0;

            // Adiciona os valores a um array
            this.remain.forEach(function(d) {
                times.push(d.Tempo.value);
                projects.push(d.Projeto.value);
                remain += Number(d.Tempo.value);
            });

            if (this.journey == 'H') remain = ((maxTimeH - remain) < 0) ? 0 : (maxTimeH - remain);
            else remain = ((maxTimeM - remain) < 0) ? 0 : (maxTimeM - remain);

            if (remain != 0) {
                projects.push("Restante");
                times.push(remain);
            }

            // Cores aleatórias
            let colors = randomColors(projects.length);

            this.renderGraphRemain;
            if (!(typeof(this.renderGraphRemain) == 'undefined')) this.renderGraphRemain.destroy();

            this.renderGraphRemain = new Chart($(this.charts.remain), {
                type: 'pie',
                data: {
                    labels: projects,
                    datasets: [{
                        data: times,
                        backgroundColor: colors,
                        borderColor: colors,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: false,
                    aspectRatio: 1,
                    legend: {
                        position: 'bottom',
                    },
                    title: {
                        display: true,
                        text: 'Tempo do dia',
                    },
                    tooltips: {
                        mode: "point"
                    }
                }
            });
            $(this.charts.remain).fadeIn('slow');
        });
        await SQL_DRIVER.select(
            QueryBuilder('Total', this.registry),
            (data) => {
                this.total.push(data);
            }
        ).then(() => {
            /*
                Gerar gráfico em pizza para tempo total
            */
            $(this.charts.total).hide();

            let dates = [];
            let times = [];
            let projects = [];
            let colors = randomColors(this.total.length);

            this.total.forEach(function(d) {
                dates.push(d.Data.value);
                times.push(d.Tempo.value);
                projects.push(d.Projeto.value);
            })

            this.renderGraphTotal;
            if (!(typeof(this.renderGraphTotal) == 'undefined')) {
                this.renderGraphTotal.destroy();
            }

            this.renderGraphTotal = new Chart($(this.charts.total), {
                type: 'bar',
                data: {
                    labels: dates,
                    datasets: [{
                        data: times,
                        backgroundColor: colors,
                        borderColor: colors,
                        borderWidth: 1
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    responsive: false,
                    legend: {
                        display: false,
                    },
                    title: {
                        display: true,
                        text: 'Últimos 15 registros',
                    }
                }
            });

            $(this.charts.total).fadeIn('slow');
        });
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

function randomColors(num) {
    let colors = new Array;
    this.randDarkColor = function() {
        var lum = -0.25;
        var hex = String('#' + Math.random().toString(16).slice(2, 8).toUpperCase()).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        var rgb = "#",
            c, i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i * 2, 2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += ("00" + c).substr(c.length);
        }
        return rgb;
    }

    for (i = 0; i < num; i++) {
        colors.push(randDarkColor());
    }
    return colors;
}



module.exports = {
    PersonalResume: PersonalResume
}