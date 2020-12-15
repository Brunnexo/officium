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
class WorkerLabor {
    static updateInfo(labor) {
        Object.keys(labor).forEach((val) => {
            WorkerLabor.info[val] = labor[val];
        });
        if (typeof (WorkerLabor.onUpdate) === 'function')
            WorkerLabor.onUpdate();
        return WorkerLabor;
    }
    static inputTime(time) {
        let weekDay = new Date(WorkerLabor.info.date).getDay();
        let isWeekend = (weekDay == 0 || weekDay == 6);
        if (time > 0) {
            WorkerLabor.info.remainTime = WorkerLabor.inputTime['backRemain'];
            let _remainTime = WorkerLabor.info.remainTime;
            if (!isWeekend) {
                let commonTime = Math.min(time, _remainTime.common), extraTime = Math.min((time - commonTime), _remainTime.extra);
                WorkerLabor.info.laborTime = {
                    common: commonTime,
                    extra: extraTime
                };
                _remainTime.common -= commonTime;
                _remainTime.extra -= (extraTime > 10 ? extraTime : 0);
            }
            else {
            }
        }
        else
            WorkerLabor.info.remainTime = WorkerLabor.inputTime['backRemain'];
        // console.log(JSON.stringify(this.inputTime['backup']));
    }
    static clear() {
        let _info = WorkerLabor.info;
        _info.function = '';
        _info.wo = '';
        _info.description = '';
        WorkerLabor.inputTime['backRemain'] = undefined;
        return WorkerLabor;
    }
    static getData() {
        return __awaiter(this, void 0, void 0, function* () {
            var SQL_DRIVER = new MSSQL_1.MSSQL();
            let _info = WorkerLabor.info;
            _info.data = {
                history: [],
                labor: [],
                total: []
            };
            SQL_DRIVER.connect().then(() => __awaiter(this, void 0, void 0, function* () {
                yield SQL_DRIVER.select(MSSQL_1.MSSQL.QueryBuilder('History', _info.registry, _info.date), (data) => {
                    _info.data.history.push(data);
                });
                yield SQL_DRIVER.select(MSSQL_1.MSSQL.QueryBuilder('Labor', _info.registry, _info.date), (data) => {
                    _info.data.labor.push(data);
                });
                yield SQL_DRIVER.select(MSSQL_1.MSSQL.QueryBuilder('LaborSR', _info.registry, _info.date), (data) => {
                    _info.data.labor.push(data);
                });
                yield SQL_DRIVER.select(MSSQL_1.MSSQL.QueryBuilder('Total', _info.registry), (data) => {
                    _info.data.total.push(data);
                });
                let dateObj = new Date(_info.date);
                _info.remainTime = {
                    extra: Number((dateObj.getDay() == 0 || dateObj.getDay() == 6) ? _info.workTime.weekendExtra : _info.workTime.dailyExtra),
                    common: Number(_info.journey == 'H' ? WorkerLabor.info.workTime.hourly : WorkerLabor.info.workTime.monthly)
                };
                let _remainTime = _info.remainTime;
                _info.data.labor.forEach((data) => {
                    if (data.Extra.value == 'SIM')
                        _remainTime.extra = Math.max(0, (_remainTime.extra - Number(data.Tempo.value)));
                    else
                        _remainTime.common = Math.max(0, (_remainTime.common - Number(data.Tempo.value)));
                });
                if (typeof (WorkerLabor.onLoad) === 'function')
                    WorkerLabor.onLoad();
            }));
            return WorkerLabor;
        });
    }
}
exports.WorkerLabor = WorkerLabor;
WorkerLabor.info = {};
