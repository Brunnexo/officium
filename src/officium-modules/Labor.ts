interface Labor {
    extra: number,
    common: number
}

interface Information {
    date?: string,
    registry?: number,
    journey?: 'H' | 'M',
    function?: string,
    wo?: string | number,
    description?: string,
    dayLabor?: Labor,
    workTime?: {
        hourly?: number,
        monthly?: number,
        dailyExtra?: number,
        weekendExtra?: number
    }
}


class WorkerLabor {
    static info: Information = {};

    static updateInfo(info: Information) {
        Object.keys(info).forEach((val) => {
            if (val == 'description' && info[val].length > 30) WorkerLabor.info[val] = `${info[val].substring(0, 30)}...`;
            else WorkerLabor.info[val] = info[val];
        });
        console.log(JSON.stringify(WorkerLabor.info, null, '\t'));
    }

    static updateTime(time: number) {
        let dateObject = new Date(WorkerLabor.info.date);
        let isWeekend = (dateObject.getDay() == 6 || dateObject.getDay() == 0);

        


    }

    static clear() {
        WorkerLabor.info = {};
    }



    /*static toQuery(execute: Function) {
        let query: string = '';
        let labor = WorkerLabor.labor;
        
        if (labor.common > 0) {
            query += `INSERT INTO [Relatórios] ([Registro], [Data], [Função], [WO], [Descrição], [Tempo], [Extra])
                            VALUES('${labor.registry}', '${labor.date}', '${labor.function}', '${labor.wo}', '${labor.description}', '${labor.common}', 'FALSE')`;
        }
        if (labor.extra > 10) {
            query += ` INSERT INTO [Relatórios] ([Registro], [Data], [Função], [WO], [Descrição], [Tempo], [Extra])
                            VALUES('${labor.registry}', '${labor.date}', '${labor.function}', '${labor.wo}', '${labor.description}', '${labor.extra}', 'TRUE')`;
        }
        return query;
    }*/

    /*static toObject() {
        let labor = WorkerLabor.labor;
        let object = [];
        let dateSplit = labor.date.split('-');

        if (labor.common > 0) {
            object.push({
                Função: labor.function,
                Data: `${dateSplit[2]}/${dateSplit[1]}/${dateSplit[0]}`,
                WO: labor.wo,
                Descrição: labor.description,
                Tempo: Number(labor.common),
                Extra: 'Não'
            });
        }
        if (labor.extra > 10) {
            object.push({
                Função: labor.function,
                Data: `${dateSplit[2]}/${dateSplit[1]}/${dateSplit[0]}`,
                WO: labor.wo,
                Descrição: labor.description,
                Tempo: Number(labor.extra),
                Extra: 'Sim'
            });
        }
        return object;
    }*/
}

export { WorkerLabor };

