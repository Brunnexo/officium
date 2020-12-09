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
const borderColor = 'rgba(255, 255, 255, 0.5)';
class RenderResume {
    constructor(value) {
        this.info = value;
        this.data = {
            resume: new Array,
            remain: new Array,
            total: new Array
        };
        this.MSSQL = new MSSQL_1.MSSQL();
    }
    getData(date) {
        return __awaiter(this, void 0, void 0, function* () {
            let registry = this.info.registry, journey = this.info.journey, workTime = this.info.workTime, resumeData = this.data.resume, remainData = this.data.remain, remainChart = document.getElementById(this.info.charts.remain), totalData = this.data.total, totalChart = document.getElementById(this.info.charts.total), extraData = this.data.extra, extraChart = document.getElementById(this.info.charts.extra), history = document.getElementById(this.info.charts.history), title = document.getElementById(this.info.title);
            let chartDate = new Date(date);
            let isWeekend = (chartDate.getDay() >= 6);
            resumeData = [];
            remainData = [];
            totalData = [];
            extraData = [];
            yield this.MSSQL.select(MSSQL_1.MSSQL.QueryBuilder('History', registry, date), (data) => {
                resumeData.push(data);
            }).then(() => {
                history.style.display = 'none';
                title.style.display = 'none';
                title.innerHTML = `Resumo de ${dateFormat(date)}<hr>`;
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
                    projects.push("RESTANTE");
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
                                borderColor: borderColor,
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
                            text: 'Seu tempo no dia'
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
                                borderColor: borderColor,
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
            yield this.MSSQL.select(MSSQL_1.MSSQL.QueryBuilder('RemainExtra', registry, date), (row) => {
                extraData.push(row);
            }).then(() => {
                let extraTimes = new Array, extraProjects = new Array;
                let extraSumTime = 0, extraRemain;
                let extraWorkTime = (isWeekend ? this.info.workTime.weekendExtra : this.info.workTime.dailyExtra);
                extraData.forEach((d) => {
                    extraTimes.push(d.Tempo.value);
                    extraProjects.push(d.Projeto.value);
                    extraSumTime += Number(d.Tempo.value);
                });
                extraRemain = Math.max(0, (extraWorkTime - extraSumTime));
                if (extraRemain > 0) {
                    extraProjects.push('RESTANTE');
                    extraTimes.push(extraRemain);
                }
                let extraColors = randomColors(extraProjects.length);
                this.renderGraphExtra;
                if (!(typeof (this.renderGraphExtra) == 'undefined'))
                    this.renderGraphExtra.destroy();
                this.renderGraphExtra = new chart_js_1.Chart(extraChart, {
                    type: 'pie',
                    data: {
                        labels: extraProjects,
                        datasets: [
                            {
                                data: extraTimes,
                                backgroundColor: extraColors,
                                borderColor: borderColor,
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
                            text: `Seu tempo extra no dia`
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
exports.RenderResume = RenderResume;
class RenderSR {
    constructor(value) {
        this.info = value;
        this.MSSQL = new MSSQL_1.MSSQL();
        this.data = {
            total: new Array
        };
    }
    getData(date, time = 0, returnTime) {
        return __awaiter(this, void 0, void 0, function* () {
            let chartDate = new Date(date);
            let isWeekend = (chartDate.getDay() >= 6);
            let registry = this.info.registry, journey = this.info.journey, workTime = (journey == 'H' ? this.info.workTime.hourly : this.info.workTime.monthly);
            let extra = 0, sumTime = 0, remain = 0;
            this.data.remain = [];
            yield this.MSSQL.select(MSSQL_1.MSSQL.QueryBuilder('Remain', registry, date), (row) => {
                this.data.remain.push(row);
            }).then(() => {
                let remainData = this.data.remain;
                let remainChart = document.getElementById(this.info.charts.remain);
                let times = new Array, projects = new Array;
                remainData.forEach((d) => {
                    times.push(d.Tempo.value);
                    projects.push(d.Projeto.value);
                    sumTime += Number(d.Tempo.value);
                });
                remain = Math.max(0, (workTime - sumTime));
                if (time > 0) {
                    if (((remain - time) < 0) && (remain > 0)) {
                        projects.push('SEU REGISTRO');
                        times.push(remain);
                        if (typeof (returnTime) === 'function')
                            returnTime({ common: remain });
                        extra = !isWeekend ? Math.abs((remain - time)) : time;
                    }
                    else if ((remain - time) >= 0) {
                        projects.push('SEU REGISTRO');
                        times.push(time);
                        if (typeof (returnTime) === 'function')
                            returnTime({ common: time });
                    }
                }
                else {
                    if (typeof (returnTime) === 'function')
                        returnTime({ common: 0 });
                }
                if (remain > 0 && (remain - time) > 0) {
                    projects.push("RESTANTE");
                    times.push(remain - time);
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
                                borderColor: borderColor,
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
                            text: `Tempo do dia (máx. de ${workTime} minutos)`
                        },
                        tooltips: {
                            mode: "point"
                        }
                    }
                });
                if (isWeekend) {
                    remainChart.style.display = 'none';
                    if (typeof (returnTime) === 'function')
                        returnTime({ common: 0 });
                }
            });
            this.data.extra = [];
            yield this.MSSQL.select(MSSQL_1.MSSQL.QueryBuilder('RemainExtra', registry, date), (row) => {
                this.data.extra.push(row);
            }).then(() => {
                let remainExtraData = this.data.extra;
                let remainExtraChart = document.getElementById(this.info.charts.extra), notification = document.getElementById(this.info.notification);
                function notify(elmnt, text) {
                    elmnt.textContent = text;
                    elmnt.classList.add('show');
                    setTimeout(() => { elmnt.classList.remove('show'); }, 3000);
                }
                let extraTimes = new Array, extraProjects = new Array;
                let extraSumTime = 0, extraRemain;
                let extraWorkTime = (isWeekend ? this.info.workTime.weekendExtra : this.info.workTime.dailyExtra);
                remainExtraData.forEach((d) => {
                    extraTimes.push(d.Tempo.value);
                    extraProjects.push(d.Projeto.value);
                    extraSumTime += Number(d.Tempo.value);
                });
                extraRemain = Math.max(0, (extraWorkTime - extraSumTime));
                if (extra > 10) {
                    if (extra > extraRemain && (extraRemain >= extraWorkTime)) {
                        extraProjects.push('SEU REGISTRO');
                        extraTimes.push(extraRemain);
                        if (typeof (returnTime) === 'function')
                            returnTime({ extra: extraRemain });
                        notify(notification, 'Seu registro ultrapassa o tempo de H.E.');
                    }
                    else if ((extraRemain - extra) >= 0) {
                        extraProjects.push('SEU REGISTRO');
                        extraTimes.push(extra);
                        if (typeof (returnTime) === 'function')
                            returnTime({ extra: extra });
                        notify(notification, 'Seu registro contém tempo de H.E.');
                    }
                }
                else if (extra > 0 && extra <= 10 && extraRemain >= 10) {
                    if (typeof (returnTime) === 'function')
                        returnTime({ extra: 0 });
                    notify(notification, 'H.E. menor que 10 minutos é desconsiderada!');
                }
                else {
                    if (typeof (returnTime) === 'function')
                        returnTime({ extra: 0 });
                }
                if (extra > 0 && extraRemain <= 0) {
                    notify(notification, 'Não há tempo restante para H.E.!');
                    if (typeof (returnTime) === 'function')
                        returnTime({ extra: 0 });
                }
                extra = (extra > 10 ? extra : 0);
                if (extraRemain > 0 && (extraRemain - extra) > 0) {
                    extraProjects.push("RESTANTE");
                    extraTimes.push(extraRemain - extra);
                }
                let extraColors = randomColors(extraProjects.length);
                this.renderGraphRemainExtra;
                if (!(typeof (this.renderGraphRemainExtra) == 'undefined'))
                    this.renderGraphRemainExtra.destroy();
                this.renderGraphRemainExtra = new chart_js_1.Chart(remainExtraChart, {
                    type: 'pie',
                    data: {
                        labels: extraProjects,
                        datasets: [
                            {
                                data: extraTimes,
                                backgroundColor: extraColors,
                                borderColor: borderColor,
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
                            text: `Tempo extra do dia (máx. de ${extraWorkTime} minutos)`
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
    let colors = new Array;
    let getRandomColor = function () {
        var letters = 'ABCDE'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * letters.length)];
        }
        return color;
    };
    for (let i = 0; i < num; i++) {
        colors.push(getRandomColor());
    }
    return colors;
}
