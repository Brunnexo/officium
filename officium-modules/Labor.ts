interface Labor {
    function?: string,
    wo?: string | number,
    description?: string,
    time?: number,
    extra?: boolean
}

class WorkerLabor {
    public static labor: Array<Labor>;

    toQuery(execute: Function) {
        let _labor = WorkerLabor.labor;
        if (typeof(execute) === 'function') {
            for (let i = 0; i < _labor.length; i++) {
                let _l = _labor[i];
                execute(
                    [`${_l.function}`,
                     `${_l.wo}`,
                     `${_l.description}`,
                     `${_l.time}`,
                     `${_l.extra}`]
                );
            }
        }
    }

    add(value: Labor) {
        
    }

    clear() {
        WorkerLabor.labor = new Array<Labor>();
    }
}