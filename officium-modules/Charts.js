"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Charts = void 0;
const chart_js_1 = require("chart.js");
const electron_1 = require("electron");
const MSSQL_1 = require("./MSSQL");
const Menu = electron_1.remote.Menu;
const MenuItem = electron_1.remote.MenuItem;
const dateFormat = (d) => `${d.split('-')[2]}/${d.split('-')[1]}/${d.split('-')[0]}`;
const week = {
    0: 'domingo',
    1: 'segunda-feira',
    2: 'terça-feira',
    3: 'quarta-feira',
    4: 'quinta-feira',
    5: 'sexta-feira',
    6: 'sábado'
};
class Charts {
    constructor(comp) {
        this.components = comp;
        this.MSSQL = new MSSQL_1.MSSQL();
    }
    updateInfo(comp) {
        Object.keys(comp)
            .forEach((val) => {
            this.components[val] = comp[val];
        });
    }
    render(data) {
        let _components = this.components, _data = data.data, _remainTime = data.remainTime, _laborTime = data.laborTime;
        let elements = {
            title: document.getElementById(_components.title),
            historyTable: document.getElementById(_components.historyTable),
            laborChart: document.getElementById(_components.laborChart),
            totalChart: document.getElementById(_components.totalChart),
            extraChart: document.getElementById(_components.extraChart),
        };
        // Tabela de Resumo
        if (elements.historyTable != null && elements.title != null) {
            elements.title.innerHTML = `Resumo de ${week[new Date(data.date).getUTCDay()]}, ${dateFormat(data.date)}`;
            elements.historyTable.innerHTML = '';
            let tbody = document.createElement('tbody');
            if (!(Object.keys(_data.history).length === 0)) {
                let thead = document.createElement('thead'), table = document.createElement('table');
                table.classList.add('table');
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
                _data.history.forEach((data) => {
                    let tr = document.createElement('tr');
                    tr.innerHTML = `
                        <th scope="row">${data['ID'].value}</th>
                        <th>${data['Função'].value}</th>
                        <th>${data['WO'].value}</th>
                        <th>${data['Descrição'].value}</th>
                        <th>${toHour(data['Tempo'].value)} (${data['Tempo'].value}min)</th>
                        <th>${data['Extra'].value}</th>`;
                    tbody.appendChild(tr);
                });
                table.appendChild(tbody);
                elements.historyTable.appendChild(table);
                var id, elmnt;
                // Menu
                const menu = new Menu();
                const menuItem = new MenuItem({
                    label: 'Apagar',
                    click: () => {
                        this.MSSQL.execute(`DELETE FROM [Relatórios] WHERE [ID] = ${id}`).then(() => {
                            let postElmnt = elmnt;
                            elmnt.style.transitionDuration = '1s';
                            elmnt.style.opacity = '0';
                            setTimeout(() => {
                                postElmnt.style.display = 'none';
                            }, 1000);
                        });
                    }
                });
                menu.append(menuItem);
                // Menu de contexto
                tbody.oncontextmenu = (ev) => {
                    elmnt = ev.target.parentElement;
                    id = Number(elmnt.getElementsByTagName("th")[0].innerHTML);
                    menu.popup();
                };
            }
            else
                elements.historyTable.innerHTML = '<h5 class="display-4 text-center">Não há registros para mostrar...</h5>';
        }
        // Gráfico de tempo apontado
        if (elements.laborChart != null) {
            let day = new Date(data.date).getUTCDay();
            if (day == 6 || day == 0)
                elements.laborChart.style.display = 'none';
            else
                elements.laborChart.style.display = 'unset';
            let splitData = {
                times: [],
                projects: []
            };
            _data.labor.forEach((data) => {
                if (data.Extra.value == 'NÃO') {
                    splitData.times.push(data.Tempo.value);
                    splitData.projects.push(data.Projeto.value);
                }
            });
            if ((_remainTime.common - _laborTime.common) > 0) {
                splitData.times.push(_laborTime.common > 0 ? (_remainTime.common - _laborTime.common) : _remainTime.common);
                splitData.projects.push('RESTANTE');
            }
            if (typeof (_laborTime) !== 'undefined' && _laborTime.common > 0) {
                splitData.times.push(_laborTime.common);
                splitData.projects.push('SEU REGISTRO');
            }
            let colors = randomColors(splitData.times.length);
            this.renderChartLabor;
            if (!(typeof (this.renderChartLabor) == 'undefined'))
                this.renderChartLabor.destroy();
            this.renderChartLabor = new chart_js_1.Chart(elements.laborChart, {
                type: 'pie',
                data: {
                    labels: splitData.projects,
                    datasets: [
                        {
                            data: splitData.times,
                            backgroundColor: colors,
                            borderColor: 'rgba(200, 200, 200, 0.5)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: false,
                    maintainAspectRatio: true,
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Tempo registrado'
                    },
                    tooltips: {
                        mode: "point"
                    }
                }
            });
        }
        // Gráfico de tempo extra
        if (elements.extraChart != null) {
            let splitData = {
                times: [],
                projects: []
            };
            _data.labor.forEach((data) => {
                if (data.Extra.value == 'SIM') {
                    splitData.times.push(data.Tempo.value);
                    splitData.projects.push(data.Projeto.value);
                }
            });
            if ((_remainTime.extra - _laborTime.extra) > 0) {
                splitData.times.push(_laborTime.extra > 0 ? (_remainTime.extra - _laborTime.extra) : _remainTime.extra);
                splitData.projects.push('RESTANTE');
            }
            if (typeof (_laborTime) !== 'undefined' && _laborTime.extra > 0) {
                splitData.times.push(_laborTime.extra);
                splitData.projects.push('SEU REGISTRO');
            }
            let colors = randomColors(splitData.times.length);
            this.renderChartExtra;
            if (!(typeof (this.renderChartExtra) == 'undefined'))
                this.renderChartExtra.destroy();
            this.renderChartExtra = new chart_js_1.Chart(elements.extraChart, {
                type: 'pie',
                data: {
                    labels: splitData.projects,
                    datasets: [
                        {
                            data: splitData.times,
                            backgroundColor: colors,
                            borderColor: 'rgba(200, 200, 200, 0.5)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: false,
                    maintainAspectRatio: true,
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Tempo extra'
                    },
                    tooltips: {
                        mode: "point"
                    }
                }
            });
        }
        // Gráfico de barras de total apontado
        if (elements.totalChart != null) {
            let splitData = {
                dates: [],
                times: [],
                colors: randomColors(_data.total.length)
            };
            _data.total.forEach((data) => {
                splitData.dates.push(data.Data.value);
                splitData.times.push(data.Tempo.value);
            });
            this.renderChartTotal;
            if (!(typeof (this.renderChartTotal) === 'undefined')) {
                this.renderChartTotal.destroy();
            }
            this.renderChartTotal = new chart_js_1.Chart(elements.totalChart, {
                type: 'bar',
                data: {
                    labels: splitData.dates,
                    datasets: [
                        {
                            data: splitData.times,
                            backgroundColor: splitData.colors,
                            borderColor: splitData.colors,
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: false,
                    maintainAspectRatio: false,
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Últimos 15 dias registrados'
                    }
                }
            });
        }
    }
}
exports.Charts = Charts;
function toHour(num) {
    var hours = (num / 60), rhours = Math.floor(hours), minutes = (hours - rhours) * 60, rminutes = Math.round(minutes);
    return `${rhours}h ${rminutes}min`;
}
function randomColors(num) {
    let colors = new Array;
    for (let i = 0; i < num; i++)
        colors.push(`#${((((1 << 24) - 1) * Math.random() | 0).toString(16)).padEnd(6, '0')}`);
    return colors;
}
