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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageLoader = exports.MSSQL = void 0;
const fs_1 = __importDefault(require("fs"));
const tedious_1 = require("tedious");
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
        let query = fs_1.default.readFileSync(`${__dirname}/SQL/${sql}.sql`, 'utf-8');
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
    indexbar: 'r-indexbar',
    index: 'r-index',
    previous: 'r-previous',
    next: 'r-next'
};
const C = {
    loader: 'c-loader',
    container: 'c-loader-container'
};
;
class PageLoader {
    constructor() {
        this.content = {
            pages: {
                Column: [],
                Row: [],
                Indexbar: []
            }
        };
        // Row indexbar
        document.querySelectorAll(`[${R.index}]`)
            .forEach((elmnt, key) => {
            this.content.pages.Indexbar.push({
                index: Number(elmnt.getAttribute(R.index)),
                html: elmnt.outerHTML
            });
            elmnt.remove();
        });
        // Row pages
        document.querySelectorAll(`[${R.loader}]`)
            .forEach((elmnt, key) => {
            this.content.pages.Row.push({
                id: elmnt.id,
                html: elmnt.innerHTML,
                index: elmnt.getAttribute(R.loader),
                next: elmnt.getAttribute(R.next),
                previous: elmnt.getAttribute(R.previous),
                parent: elmnt.parentElement
            });
            elmnt.remove();
        });
        // Column pages
        document.querySelectorAll(`[${C.loader}]`)
            .forEach((elmnt, key) => {
            this.content.pages.Column.push({
                id: elmnt.id,
                html: elmnt.innerHTML,
                updateable: elmnt.hasAttribute('updateable')
            });
            elmnt.remove();
        });
    }
    load(id) {
        let Row = this.content.pages.Row;
        let Column = this.content.pages.Column;
        if (Row.some(page => page.id === id)) {
            let rPage = Row.filter((val) => { return val.id === id; })[0];
            let cPage = Column.filter((val) => { return val.id === rPage.parent.id; })[0];
            document.querySelector(`[${C.container}]`).innerHTML = cPage.html;
            document.querySelector(`[${R.container}]`).innerHTML = rPage.html;
            this.content.status = {
                actual: {
                    page: id,
                    type: 'R'
                }
            };
        }
        else if (Column.some(page => page.id === id)) {
            let cPage = Column.filter((val) => { return val.id === id; })[0];
            document.querySelector(`[${C.container}]`).innerHTML = cPage.html;
            this.content.status = {
                actual: {
                    page: id,
                    type: 'C'
                }
            };
        }
        else
            throw new Error(`There is no page with this ID: ${id}`);
    }
    update() {
        var _a, _b;
        let Column = this.content.pages.Column;
        let id = (_a = this.content.status) === null || _a === void 0 ? void 0 : _a.actual.page;
        switch ((_b = this.content.status) === null || _b === void 0 ? void 0 : _b.actual.type) {
            case 'C':
                let cPage = Column.filter((val) => { return val.id === id; })[0];
                if (cPage.updateable)
                    document.querySelector(`[${C.container}]`).innerHTML = cPage.html;
                break;
        }
    }
}
exports.PageLoader = PageLoader;
