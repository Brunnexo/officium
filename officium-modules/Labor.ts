interface Labor {
    journey?: 'H' | 'M',
    dayLabor?: {
        extraRemain?: number,
        commonRemain?: number
    }
    function?: string,
    wo?: string | number,
    description?: string,
    time?: number,
}

class WorkerLabor {
    static labor: Labor;

    static update(info: Labor) {
        WorkerLabor.labor = info;
    }

    static toQuery(execute: Function) {
        
    }
}