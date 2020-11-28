"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderSR = exports.RenderResume = void 0;
const chart_js_1 = require("chart.js");
const electron_1 = require("electron");
const MSSQL_1 = require("./MSSQL");
const Menu = electron_1.remote.Menu;
const MenuItem = electron_1.remote.MenuItem;
class RenderResume {
    constructor(value) {
        this.info = value;
        this.data = {
            resume: new Array,
            remain: new Array,
            total: new Array
        };
        this.MSSQL = new MSSQL_1.MSSQL(electron_1.remote.getGlobal('sql').config);
    }
    getData(date) {
        return __awaiter(this, void 0, void 0, function* () {
            let registry = this.info.registry, journey = this.info.journey, workTime = this.info.workTime, resumeData = this.data.resume, remainData = this.data.remain, remainChart = document.getElementById(this.info.charts.remain), totalData = this.data.total, totalChart = document.getElementById(this.info.charts.total), history = document.getElementById(this.info.charts.history), title = document.getElementById(this.info.title);
            resumeData = [];
            remainData = [];
            totalData = [];
            yield this.MSSQL.select(MSSQL_1.MSSQL.QueryBuilder('History', registry, date), (data) => {
                resumeData.push(data);
            }).then(() => {
                history.style.display = 'none';
                title.style.display = 'none';
                title.innerHTML = `Resumo de ${dateFormat(date)}
                                <hr>`;
                let tbody = document.createElement('tbody');
                if (!(Object.keys(resumeData).length === 0)) {
                    let thead = document.createElement('thead');
                    let table = document.createElement('table');
                    table.classList.add('table');
                    table.innerHTML = `
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
                    resumeData.forEach((arr) => {
                        let tr = document.createElement('tr');
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
                    history.innerHTML = '';
                    history.appendChild(table);
                    history.style.display = 'unset';
                    title.style.display = 'unset';
                }
                else {
                    history.innerHTML = '<h5 class="display-4 text-center">Não há registros para mostrar...</h5>';
                    history.style.display = 'unset';
                    title.style.display = 'unset';
                }
                var id, elmnt;
                const menu = new Menu();
                const menuItem = new MenuItem({
                    label: 'Apagar',
                    click: () => {
                        this.MSSQL.execute(`DELETE FROM [Relatórios] WHERE [ID] = ${id}`).then(() => {
                            elmnt.style.transitionDuration = '1s';
                            elmnt.style.opacity = '0';
                            setTimeout(() => { elmnt.style.display = 'none'; }, 1000);
                        });
                    }
                });
                menu.append(menuItem);
                tbody.oncontextmenu = (ev) => {
                    ev.preventDefault();
                    elmnt = ev.target.parentElement;
                    id = Number(elmnt.getElementsByTagName("th")[0].innerHTML);
                    menu.popup();
                };
            });
            yield this.MSSQL.select(MSSQL_1.MSSQL.QueryBuilder('Remain', registry, date), (data) => {
                remainData.push(data);
            }).then(() => {
                remainChart.style.display = 'none';
                let times = new Array;
                let projects = new Array;
                let remain = 0;
                remainData.forEach(function (d) {
                    times.push(d.Tempo.value);
                    projects.push(d.Projeto.value);
                    remain += Number(d.Tempo.value);
                });
                if (journey == 'H')
                    remain = ((workTime.hourly - remain) < 0) ? 0 : (workTime.hourly - remain);
                else
                    remain = ((workTime.monthly - remain) < 0) ? 0 : (workTime.monthly - remain);
                if (remain != 0) {
                    projects.push("Restante");
                    times.push(remain);
                }
                let colors = randomColors(projects.length);
                this.renderGraphRemain;
                if (!(typeof (this.renderGraphRemain) == 'undefined'))
                    this.renderGraphRemain.destroy();
                this.renderGraphRemain = new chart_js_1.Chart(remainChart, {
                    type: 'pie',
                    data: {
                        labels: projects,
                        datasets: [
                            {
                                data: times,
                                backgroundColor: colors,
                                borderColor: colors,
                                borderWidth: 1
                            }
                        ]
                    },
                    options: {
                        responsive: false,
                        aspectRatio: 1,
                        legend: {
                            position: 'bottom'
                        },
                        title: {
                            display: true,
                            text: 'Tempo do dia'
                        },
                        tooltips: {
                            mode: "point"
                        }
                    }
                });
                remainChart.style.display = 'unset';
            });
            yield this.MSSQL.select(MSSQL_1.MSSQL.QueryBuilder('Total', registry), (data) => {
                totalData.push(data);
            }).then(() => {
                totalChart.style.display = 'none';
                let dates = [], times = [], projects = [], colors = randomColors(totalData.length);
                totalData.forEach((d) => {
                    dates.push(d.Data.value);
                    times.push(d.Tempo.value);
                    projects.push(d.Projeto.value);
                });
                this.renderGraphTotal;
                if (!(typeof (this.renderGraphTotal) === 'undefined')) {
                    this.renderGraphTotal.destroy();
                }
                this.renderGraphTotal = new chart_js_1.Chart(totalChart, {
                    type: 'bar',
                    data: {
                        labels: dates,
                        datasets: [
                            {
                                data: times,
                                backgroundColor: colors,
                                borderColor: colors,
                                borderWidth: 1
                            }
                        ]
                    },
                    options: {
                        maintainAspectRatio: false,
                        responsive: false,
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Últimos 15 registros'
                        }
                    }
                });
                totalChart.style.display = 'unset';
            });
        });
    }
}
exports.RenderResume = RenderResume;
class RenderSR {
    constructor(value) {
        this.info = value;
        this.MSSQL = new MSSQL_1.MSSQL(electron_1.remote.getGlobal('sql').config);
        this.data = {
            total: new Array
        };
    }
    getData(date) {
        return __awaiter(this, void 0, void 0, function* () {
            let common = document.getElementById(this.info.infos.common), extra = document.getElementById(this.info.infos.extra), remainChart = document.getElementById(this.info.charts.remain), workTime = this.info.workTime, registry = this.info.registry, journey = this.info.journey, remainData = this.data.remain;
            remainData = [];
            yield this.MSSQL.select(MSSQL_1.MSSQL.QueryBuilder('Remain', registry, date), (row) => {
                remainData.push(row);
            }).then(() => {
                remainChart.style.display = 'none';
                let times = new Array;
                let projects = new Array;
                let remain = 0;
                remainData.forEach(function (d) {
                    times.push(d.Tempo.value);
                    projects.push(d.Projeto.value);
                    remain += Number(d.Tempo.value);
                });
                if (journey == 'H')
                    remain = ((workTime.hourly - remain) < 0) ? 0 : (workTime.hourly - remain);
                else
                    remain = ((workTime.monthly - remain) < 0) ? 0 : (workTime.monthly - remain);
                if (remain != 0) {
                    projects.push("Restante");
                    times.push(remain);
                }
                let colors = randomColors(projects.length);
                this.renderGraphRemain = new chart_js_1.Chart(remainChart, {
                    type: 'pie',
                    data: {
                        labels: projects,
                        datasets: [
                            {
                                data: times,
                                backgroundColor: colors,
                                borderColor: colors,
                                borderWidth: 1
                            }
                        ]
                    },
                    options: {
                        responsive: false,
                        aspectRatio: 1,
                        legend: {
                            position: 'bottom'
                        },
                        title: {
                            display: true,
                            text: 'Tempo do dia'
                        },
                        tooltips: {
                            mode: "point"
                        }
                    }
                });
            });
        });
    }
}
exports.RenderSR = RenderSR;
function dateFormat(date, separator = '/') {
    let get;
    switch (separator) {
        case '/':
            get = date.split('-');
            return `${get[2]}/${get[1]}/${get[0]}`;
        case '-':
            get = date.split('/');
            return `${get[2]}-${get[1]}-${get[0]}`;
    }
}
function randomColors(num) {
    let colors = [];
    let diff = 0;
    for (let i = 0; i < num; i++) {
        if (i <= 51) {
            let r = Math.round(Math.random() * ((255 - diff) - (0 + diff) + 1) + (0 + diff));
            let g = Math.round(Math.random() * ((255 - diff) - (0 + diff) + 1) + (0 + diff));
            let b = Math.round(Math.random() * ((255 - diff) - (0 + diff) + 1) + (0 + diff));
            colors.push(`rgba(${r}, ${g}, ${b}, 0.5)`);
            diff += 5;
        }
    }
    return colors;
}
