import { MSSQL } from './MSSQL';

interface Labor {
    date?: string,
    registry?: number,
    journey?: 'H' | 'M',

    function?: string,
    wo?: string,
    description?: string,
    laborTime?: {
        extra: number,
        common: number
    },
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
            WorkerLabor.info[val] = labor[val];      
        });

        if (typeof(WorkerLabor.onUpdate) === 'function') WorkerLabor.onUpdate();
        return WorkerLabor;
    }

    static inputTime(time: number) {
        let weekDay = new Date(WorkerLabor.info.date).getDay();
        let isWeekend = (weekDay == 0 || weekDay == 6);

        

        if (time > 0) {
            WorkerLabor.info.remainTime = WorkerLabor.inputTime['backRemain'];
            let _remainTime = WorkerLabor.info.remainTime;

            if (!isWeekend) {
                let commonTime = Math.min(time, _remainTime.common),
                    extraTime = Math.min((time - commonTime), _remainTime.extra);

                WorkerLabor.info.laborTime = {
                    common: commonTime,
                    extra: extraTime
                }

                _remainTime.common -= commonTime;
                _remainTime.extra -= (extraTime > 10 ? extraTime : 0);
            } else {

            }

        } else WorkerLabor.info.remainTime = WorkerLabor.inputTime['backRemain'];

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

    static async getData() {
        var SQL_DRIVER = new MSSQL();
        let _info = WorkerLabor.info;

        _info.data = {
            history: [],
            labor: [],
            total: []
        }

        SQL_DRIVER.connect().then(async () => {
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
                common: Number(_info.journey == 'H' ? WorkerLabor.info.workTime.hourly : WorkerLabor.info.workTime.monthly)
            }
    
            let _remainTime = _info.remainTime;
    
            _info.data.labor.forEach((data: any) => {
                if (data.Extra.value == 'SIM') _remainTime.extra = Math.max(0, (_remainTime.extra - Number(data.Tempo.value)));
                else _remainTime.common = Math.max(0, (_remainTime.common - Number(data.Tempo.value)));
            });
    
            if (typeof(WorkerLabor.onLoad) === 'function') WorkerLabor.onLoad();
        });
        return WorkerLabor;
    }
}

export { WorkerLabor, Labor };

