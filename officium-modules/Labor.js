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
exports.WorkerLabor = void 0;
const MSSQL_1 = require("./MSSQL");
const LIMIT = 50;
class WorkerLabor {
    static updateInfo(labor) {
        Object.keys(labor).forEach((val) => {
            if (val == 'description' && labor[val].length > LIMIT)
                WorkerLabor.info[val] = `${labor[val].substring(0, LIMIT)}...`;
            else
                WorkerLabor.info[val] = labor[val];
        });
        return WorkerLabor;
    }
    static clear() {
        WorkerLabor.info = {};
        return WorkerLabor;
    }
    static getData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var SQL_DRIVER = new MSSQL_1.MSSQL();
            let _info = WorkerLabor.info;
            _info.data = {
                history: [],
                labor: [],
                total: []
            };
            yield SQL_DRIVER.select(MSSQL_1.MSSQL.QueryBuilder('History', _info.registry, _info.date), (data) => {
                _info.data.history.push(data);
            });
            yield SQL_DRIVER.select(MSSQL_1.MSSQL.QueryBuilder('Labor', _info.registry, _info.date), (data) => {
                _info.data.labor.push(data);
            });
            yield SQL_DRIVER.select(MSSQL_1.MSSQL.QueryBuilder('Total', _info.registry), (data) => {
                _info.data.total.push(data);
            });
            if (typeof (data) === 'function')
                data(_info.data);
            return WorkerLabor;
        });
    }
}
exports.WorkerLabor = WorkerLabor;
WorkerLabor.info = {};
