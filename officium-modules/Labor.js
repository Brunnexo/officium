class WorkerLabor {
    toQuery(execute) {
        let _labor = WorkerLabor.labor;
        if (typeof (execute) === 'function') {
            for (let i = 0; i < _labor.length; i++) {
                let _l = _labor[i];
                execute([`${_l.function}`,
                    `${_l.wo}`,
                    `${_l.description}`,
                    `${_l.time}`,
                    `${_l.extra}`]);
            }
        }
    }
    add(value) {
    }
    clear() {
        WorkerLabor.labor = new Array();
    }
}
