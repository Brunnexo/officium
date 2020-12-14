import { MSSQL } from './MSSQL';

const LIMIT = 50;

interface Labor {
    date?: string,
    registry?: number,
    journey?: 'H' | 'M',

    function?: string,
    wo?: string,
    description?: string,
    time?: string,

    remainTime?: {
        extra: number,
        common: number
    },
    workTime?: {
        hourly?: number,
        monthly?: number,
        dailyExtra?: number,
        weekendExtra?: number
    },
    data?: {
        history?: any[],
        total?: any[],
        labor?: any[]
    }
}

class WorkerLabor {
    static info: Labor = {};
    static onLoad: Function;
    static onUpdate: Function;

    static updateInfo(labor: Labor) {
        Object.keys(labor).forEach((val) => {
            if (val == 'description' && labor[val].length > LIMIT) WorkerLabor.info[val] = `${labor[val].substring(0, LIMIT)}...`;
            else WorkerLabor.info[val] = labor[val];
        });

        if (typeof(WorkerLabor.onUpdate) === 'function') WorkerLabor.onUpdate();
        return WorkerLabor;
    }

    static clear() {
        WorkerLabor.info = {};
        return WorkerLabor;
    }

    static async getData(data: Function) {
        var SQL_DRIVER = new MSSQL();
        let _info = WorkerLabor.info;

        _info.data = {
            history: [],
            labor: [],
            total: []
        }
        
        await SQL_DRIVER.select(MSSQL.QueryBuilder('History', _info.registry, _info.date), (data: any) => {
            _info.data.history.push(data);
        });

        await SQL_DRIVER.select(MSSQL.QueryBuilder('Labor', _info.registry, _info.date), (data: any) => {
            _info.data.labor.push(data);
        });

        await SQL_DRIVER.select(MSSQL.QueryBuilder('LaborSR', _info.registry, _info.date), (data: any) => {
            _info.data.labor.push(data);
        });

        await SQL_DRIVER.select(MSSQL.QueryBuilder('Total', _info.registry), (data: any) => {
            _info.data.total.push(data);
        });

        let dateObj = new Date(_info.date);

        _info.remainTime = {
            extra: Number((dateObj.getDay() == 0 || dateObj.getDay() == 6) ? _info.workTime.weekendExtra : _info.workTime.dailyExtra),
            common: Number(_info.journey == 'H' ? this.info.workTime.hourly : this.info.workTime.monthly)
        }

        let _remainTime = _info.remainTime;

        _info.data.labor.forEach((data: any) => {
            if (data.Extra.value == 'SIM') _remainTime.extra = Math.max(0, (_remainTime.extra - Number(data.Tempo.value)));
            else _remainTime.common = Math.max(0, (_remainTime.common - Number(data.Tempo.value)));
        });

        if (typeof(WorkerLabor.onLoad) === 'function') WorkerLabor.onLoad();
        if (typeof(data) === 'function') data(_info.data);
        return WorkerLabor;
    }
}

export { WorkerLabor, Labor };

