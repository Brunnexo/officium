import { remote } from 'electron';
import { MSSQL } from './Officium';

const Menu = remote.Menu;
const MenuItem = remote.MenuItem;

const borderColor = 'rgba(255, 255, 255, 0.5)';

interface History {
    ID: string | number,
    Função: string,
    WO: string | number,
    Descrição: string,
    Tempo: number,
    Extra: boolean
}

interface Information {
    title?: string,
    registry?: number | string,
    journey?: 'H' | 'M',
    charts?: {
        history?: string,
        remain?: string,
        total?: string,
        extra?: string
    },
    workTime?: {
        hourly?: number,
        monthly?: number,
        dailyExtra?: number,
        weekendExtra?: number
    },
    notification?: string;
}

interface Data {
    resume?: Array<object>,
    remain?: Array<object>,
    total?: Array<object>,
    extra?: Array<object>
}

class Render {
    static info: Information;
    
    static data: Array<any>;


    static updateInfo(info: Information) {
        Object.keys(info).forEach((d) => {
            Render[d] = info[d];
        });
    }

    static async resume(date: string) {
        let SQL = Render.SQL_DRIVER,
            info = Render.info,
            data = Render.data;

        data = [];
        
        await SQL.select(MSSQL.QueryBuilder('History', info.registry, date), (row) => {
            data.push(row);
        }).then(() => {
            // History

            data.forEach((d: History) => {
                        


            })


        });

    }

    static async timeRemain() {
        
    }
}

export { Render };

