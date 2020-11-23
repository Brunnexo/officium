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
exports.PersonalResume = exports.ColorMode = exports.PageLoader = exports.MSSQL = void 0;
const electron_1 = require("electron");
const tedious_1 = require("tedious");
const { Chart } = require('chart.js');
const fs = require('fs');
class MSSQL {
    constructor(config) {
        MSSQL.SQL_VARIABLE = '@VAR';
        this.Attr = {
            Connected: false
        };
        if (typeof (config) != 'object')
            throw new Error(`SQL 'Tedious' configuration not defined! (${typeof (config)})`);
        else {
            console.log('SQL Configuration set!');
            console.log(JSON.stringify(config, null, '\t'));
            this.Config = config;
        }
    }
    ;
    static setVariable(variable) {
        if (typeof (variable) == 'string')
            MSSQL.SQL_VARIABLE = `@${variable}`;
        else
            throw new Error('The SQL Variable must be a String sequencer! Example "@VAR" for @VAR0, @VAR1...');
    }
    ;
    static QueryBuilder(sql, ...args) {
        let query = fs.readFileSync(`${__dirname}/SQL/${sql}.sql`, 'utf-8');
        let varCount = Number(query.split(MSSQL.SQL_VARIABLE).length - 1);
        if (varCount != args.length) {
            throw new Error(`The number of arguments does not match the SQL's necessary variables count!
            Number of arguments: ${args.length}
            Number of SQL variables: ${varCount}`);
        }
        else {
            if (varCount === 0)
                return query;
            else {
                for (let i = 0; i < varCount; i++) {
                    query = query.replace(`${MSSQL.SQL_VARIABLE}${i}`, args[i]);
                }
                return query;
            }
        }
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                var _a;
                if (((_a = this.Attr) === null || _a === void 0 ? void 0 : _a.Connected) === false) {
                    this.Attr.Connection = new tedious_1.Connection(this.Config);
                    this.Attr.Connection.on('connect', (err) => {
                        if (err)
                            reject(err.message);
                        else {
                            this.Attr.Connected = true;
                            resolve(this.Attr.Connected);
                        }
                    });
                }
                else
                    resolve(true);
            });
        });
    }
    select(query, row) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connect();
            return new Promise((resolve, reject) => {
                this.Attr.Connection.execSql(new tedious_1.Request(query, (err) => {
                    if (err) {
                        reject(err.message);
                    }
                    ;
                })
                    .on('row', (data) => { row(data); })
                    .on('requestCompleted', () => { resolve(true); })
                    .on('error', (err) => { reject(err); }));
            });
        });
    }
    execute(query) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connect();
            return new Promise((resolve, reject) => {
                this.Attr.Connection.execSql(new tedious_1.Request(query, (err) => {
                    if (err)
                        reject(err.message);
                }).on('requestCompleted', () => { resolve(); }));
            });
        });
    }
}
exports.MSSQL = MSSQL;
const R = {
    loader: 'r-loader',
    container: 'r-loader-container',
    scriptLoader: 'r-loader-script',
    indexbar: 'r-indexbar',
    index: 'r-index',
    previous: 'r-previous',
    next: 'r-next'
};
const C = {
    loader: 'c-loader',
    scriptLoader: 'c-loader-script',
    container: 'c-loader-container'
};
class PageLoader {
    constructor() {
        this.content = {
            pages: {
                Column: [],
                Row: [],
                Indexbar: []
            }
        };
        document.querySelectorAll(`[${R.index}]`)
            .forEach((elmnt, key) => {
            this.content.pages.Indexbar.push({
                index: Number(elmnt.getAttribute(R.index)),
                html: elmnt.outerHTML,
            });
            elmnt.remove();
        });
        document.querySelectorAll(`[${R.loader}]`)
            .forEach((elmnt, key) => {
            let path = `${__dirname}\\PageScripts\\${elmnt.id}.js`;
            this.content.pages.Row.push({
                id: elmnt.id,
                html: elmnt.innerHTML,
                index: elmnt.getAttribute(R.loader),
                next: elmnt.getAttribute(R.next),
                previous: elmnt.getAttribute(R.previous),
                parent: elmnt.parentElement,
                script: fs.existsSync(path) ? fs.readFileSync(path, 'utf-8') : ''
            });
            elmnt.remove();
        });
        document.querySelectorAll(`[${C.loader}]`)
            .forEach((elmnt, key) => {
            let path = `${__dirname}\\PageScripts\\${elmnt.id}.js`;
            this.content.pages.Column.push({
                id: elmnt.id,
                html: elmnt.innerHTML,
                script: fs.existsSync(path) ? fs.readFileSync(path, 'utf-8') : '',
                updateable: elmnt.hasAttribute('updateable')
            });
            elmnt.remove();
        });
    }
    load(id, execute) {
        let Row = this.content.pages.Row;
        let Column = this.content.pages.Column;
        if (Row.some(page => page.id === id)) {
            let rPage = Row.filter((val) => { return val.id === id; })[0];
            let cPage = Column.filter((val) => { return val.id === rPage.parent.id; })[0];
            document.querySelector(`[${C.container}]`).innerHTML = cPage.html;
            document.querySelector(`[${R.container}]`).innerHTML = rPage.html;
            document.querySelector(`[${R.scriptLoader}]`).innerHTML = '';
            document.querySelector(`[${R.scriptLoader}]`).innerHTML = typeof (rPage.script) === 'string' ? rPage.script : '';
            this.content.status = {
                actual: {
                    page: id,
                    type: 'R'
                }
            };
            if (typeof (execute) == 'function')
                execute();
        }
        else if (Column.some(page => page.id === id)) {
            let cPage = Column.filter((val) => { return val.id === id; })[0];
            document.querySelector(`[${C.container}]`).innerHTML = cPage.html;
            document.querySelector(`[${C.scriptLoader}]`).innerHTML = '';
            document.querySelector(`[${C.scriptLoader}]`).innerHTML = typeof (cPage.script) === 'string' ? cPage.script : '';
            this.content.status = {
                actual: {
                    page: id,
                    type: 'C'
                }
            };
            if (typeof (execute) == 'function')
                execute();
        }
        else
            throw new Error(`There is no page with this ID: ${id}`);
    }
    update(execute) {
        let Column = this.content.pages.Column;
        let id = this.content.status.actual.page;
        let page = Column.filter((val) => { return val.id === id; })[0];
        if (page.updateable) {
            this.load(page.id, execute);
        }
    }
}
exports.PageLoader = PageLoader;
function ColorMode(mode) {
    let color = (mode == 'light' || mode == 'dark') ? mode : () => {
        let h = new Date().getHours();
        return (6 <= h && h < 18) ? 'light' : 'dark';
    };
    switch (color) {
        case 'light':
            document.querySelector('.view').classList.add('light');
            document.querySelector('.view').classList.remove('dark');
            document.querySelectorAll('.btn').forEach((elmnt) => {
                elmnt.classList.add('btn-dark');
                elmnt.classList.remove('btn-light');
            });
            document.querySelectorAll('.navbar').forEach((elmnt) => {
                elmnt.classList.add('navbar-light');
                elmnt.classList.remove('navbar-dark');
            });
            break;
        case 'dark':
            document.querySelector('.view').classList.add('dark');
            document.querySelector('.view').classList.remove('light');
            document.querySelectorAll('.btn').forEach((elmnt) => {
                elmnt.classList.add('btn-light');
                elmnt.classList.remove('btn-dark');
            });
            document.querySelectorAll('.navbar').forEach((elmnt) => {
                elmnt.classList.add('navbar-dark');
                elmnt.classList.remove('navbar-light');
            });
            break;
    }
}
exports.ColorMode = ColorMode;
class PersonalResume {
    constructor(value) {
        this.info = {
            title: value.title,
            registry: value.registry,
            journey: value.journey,
            charts: {
                history: typeof (value.charts.history) === 'string' ? document.getElementById(value.charts.history) : value.charts.history,
                remain: typeof (value.charts.remain) === 'string' ? document.getElementById(value.charts.remain) : value.charts.remain,
                total: typeof (value.charts.total) === 'string' ? document.getElementById(value.charts.total) : value.charts.total
            }
        };
        this.data = {
            resume: new Array,
            remain: new Array,
            total: new Array
        };
        this.MSSQL = new MSSQL(electron_1.remote.getGlobal('sql').config);
    }
    getData(date) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.MSSQL.select(MSSQL.QueryBuilder('History', this.info.registry, date), (data) => { this.data.resume.push(data); }).then(() => {
                $(this.info.charts.history).hide();
                $(this.info.title).hide()
                    .html(`Resumo de ${dateFormat(date)}`)
                    .append(`<hr>`)
                    .fadeIn('slow');
                if (!$.isEmptyObject(this.data.resume)) {
                    let thead = document.createElement('thead'), table = document.createElement('table');
                    $(table).addClass(`table`)
                        .html(`<thead>
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
                    this.data.resume.forEach((arr) => {
                        var tr = document.createElement('tr');
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
                    $(this.info.charts.history).html('')
                        .append(table)
                        .fadeIn('slow');
                }
                else {
                    $(this.info.charts.history).html('<h5 class="display-4 text-center">Não há registros para mostrar...</h5>')
                        .fadeIn('slow');
                }
                let id;
                document.getElementsByTagName('tbody')[0].oncontextmenu = (e) => {
                    e.preventDefault();
                    id = Number(e.target.parentElement.getElementsByTagName("th")[0].innerHTML);
                    console.log(id);
                };
            });
            yield this.MSSQL.select(MSSQL.QueryBuilder('Remain', this.info.registry, date), (data) => { this.data.remain.push(data); }).then(() => {
                $(this.info.charts.remain).hide();
                let times = new Array, projects = new Array, remain = 0;
                this.data.remain.forEach((d) => {
                    times.push(d.Tempo.value);
                    projects.push(d.Projeto.value);
                    remain += Number(d.Tempo.value);
                });
                if (this.info.journey == 'H')
                    remain = ((PersonalResume.maxTimeH - remain) < 0) ? 0 : (PersonalResume.maxTimeH - remain);
                else
                    remain = ((PersonalResume.maxTimeM - remain) < 0) ? 0 : (PersonalResume.maxTimeM - remain);
                if (remain != 0) {
                    projects.push("Restante");
                    times.push(remain);
                }
                let colors = randomColors(projects.length);
                this.renderGraphRemain;
                if (!(typeof (this.renderGraphRemain) == 'undefined'))
                    this.renderGraphRemain.destroy();
                this.renderGraphRemain = new Chart(this.info.charts.remain, {
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
                $(this.info.charts.remain).fadeIn('slow');
            });
            yield this.MSSQL.select(MSSQL.QueryBuilder('Total', this.info.registry), (data) => { this.data.total.push(data); }).then(() => {
                $(this.info.charts.total).hide();
                let dates = new Array, times = new Array, projects = new Array, colors = randomColors(this.data.total.length);
                this.data.total.forEach((d) => {
                    dates.push(d.Data.value);
                    times.push(d.Tempo.value);
                    projects.push(d.Projeto.value);
                });
                this.renderGraphTotal;
                if (!(typeof (this.renderGraphTotal) == 'undefined'))
                    this.renderGraphTotal.destroy();
                this.renderGraphTotal = new Chart(this.info.charts.total, {
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
                $(this.info.charts.total).fadeIn('slow');
            });
        });
    }
}
exports.PersonalResume = PersonalResume;
PersonalResume.maxTimeH = 528;
PersonalResume.maxTimeM = 522;
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
    let randDarkColor = function () {
        var lum = -0.25;
        var hex = String('#' + Math.random().toString(16).slice(2, 8).toUpperCase()).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        var rgb = "#", c, i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i * 2, 2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += ("00" + c).substr(c.length);
        }
        return rgb;
    };
    for (let i = 0; i < num; i++) {
        colors.push(randDarkColor());
    }
    return colors;
}
