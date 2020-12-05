interface Labor {
    date?: string,
    registry?: number,
    extra?: number,
    common?: number,
    function?: string,
    wo?: string | number,
    description?: string,
}

class WorkerLabor {
    static labor: Labor = {};
    static update(info: Labor, execute: Function) {
        Object.keys(info).forEach((val) => {
            WorkerLabor.labor[val] = info[val];
        });

        if (typeof(execute) === 'function') execute();
    }
    static clear() {
        WorkerLabor.labor = {};
    }
    static toQuery(execute: Function) {
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
    }
    static toTable() {
        let labor = WorkerLabor.labor;
        let table = [];
        let dateSplit = labor.date.split('-');

        table.push({
            Função: labor.function,
            Data: `${dateSplit[2]}/${dateSplit[1]}/${dateSplit[0]}`,
            WO: labor.wo,
            Descrição: labor.description,
            Tempo: Number(labor.common),
            Extra: 'Não'
        });
        if (labor.extra > 10) {
            table.push({
                Função: labor.function,
                Data: `${dateSplit[2]}/${dateSplit[1]}/${dateSplit[0]}`,
                WO: labor.wo,
                Descrição: labor.description,
                Tempo: Number(labor.extra),
                Extra: 'Sim'
            });
        }

        return table;
    }
}

export { WorkerLabor };