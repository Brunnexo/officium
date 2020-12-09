"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerLabor = void 0;
class WorkerLabor {
    static updateInfo(info) {
        Object.keys(info).forEach((val) => {
            if (val == 'description' && info[val].length > 30)
                WorkerLabor.info[val] = `${info[val].substring(0, 30)}...`;
            else
                WorkerLabor.info[val] = info[val];
        });
        console.log(JSON.stringify(WorkerLabor.info, null, '\t'));
    }
    static updateTime(time) {
        let dateObject = new Date(WorkerLabor.info.date);
        let isWeekend = (dateObject.getDay() == 6 || dateObject.getDay() == 0);
    }
    static clear() {
        WorkerLabor.info = {};
    }
}
exports.WorkerLabor = WorkerLabor;
WorkerLabor.info = {};
