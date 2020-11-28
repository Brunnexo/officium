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
exports.MSSQL = void 0;
const tedious_1 = require("tedious");
const fs = require('fs');
class MSSQL {
    constructor(config) {
        MSSQL.SQL_VARIABLE = '@VAR';
        this.Attr = {
            Connected: false
        };
        if (typeof (config) != 'object')
            throw new Error(`SQL 'Tedious' configuration not defined! (${typeof (config)})`);
        else
            this.Config = config;
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
