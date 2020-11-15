import fs from 'fs';
import { Connection, Request } from 'tedious';

interface SQLConfig {
    server: string,
    authentication: {
        type: string,
        options: {
            userName: string,
            password: string
        }
    },
    options: {
        encrypt: boolean,
        database: string,
        enableArithAbort: boolean,
        appName: string,
        useColumnNames: boolean
    }
}

interface SQLAttr {
    Connected: boolean,
    Connection?: Connection
}

class MSSQL {
    protected Config: SQLConfig;
    protected Attr?: SQLAttr;
    
    private static SQL_VARIABLE: string;

    constructor(config: SQLConfig) {

        MSSQL.SQL_VARIABLE = '@VAR';
        
        this.Attr = {
            Connected: false
        };

        if (typeof(config) != 'object')
            throw new Error(`SQL 'Tedious' configuration not defined! (${typeof(config)})`);
        else {
            console.log('SQL Configuration set!');
            console.log(JSON.stringify(config, null,'\t'));
            this.Config = config;
        }
    };

    static setVariable(variable: string) {
        if (typeof(variable) == 'string') MSSQL.SQL_VARIABLE = `@${variable}`;
        else throw new Error('The SQL Variable must be a String sequencer! Example "@VAR" for @VAR0, @VAR1...');
    };

    static QueryBuilder(sql: string, ...args: any[]) {
        let query = fs.readFileSync(`${__dirname}/SQL/${sql}.sql`, 'utf-8');
        let varCount = Number(query.split(MSSQL.SQL_VARIABLE).length - 1);
    
        if (varCount != args.length) {
            throw new Error(`The number of arguments does not match the SQL's necessary variables count!
            Number of arguments: ${args.length}
            Number of SQL variables: ${varCount}`);
        } else {
            if (varCount === 0) return query;
            else { 
                for (let i = 0; i < varCount; i++) {
                    query = query.replace(`${MSSQL.SQL_VARIABLE}${i}`, args[i]);
                }
                return query;
            }
        }
    }
    
    async connect() {
        return new Promise((resolve, reject) => {
            if(this.Attr?.Connected === false) {
                this.Attr.Connection = new Connection(this.Config);
                this.Attr.Connection.on('connect', (err: any) => {
                    if (err) reject(err.message);
                    else {
                        this.Attr!.Connected! = true;
                        resolve(this.Attr!.Connected);
                    }
                });
            } else resolve(true);
        });
    }

    async select(query: string, row: Function) {
        await this.connect();
        return new Promise((resolve, reject) => {
            this.Attr!.Connection!.execSql(
                new Request(query, (err) => {
                    if (err) {reject(err.message)};
                })
                    .on('row', (data) => {row(data)})
                    .on('requestCompleted', () => {resolve(true)})
                    .on('error', (err) => {reject(err)})
            );
        });
    }

    async execute(query: string) {
        await this.connect();
        return new Promise<void>((resolve, reject) => {
            this.Attr!.Connection!.execSql(
                new Request(query, (err) => {
                    if (err) reject(err.message);
                }).on('requestCompleted', () => {resolve()})
            )
        });
    }
}

const R = {
    loader: 'r-loader',
    container: 'r-loader-container',
    indexbar: 'r-indexbar',
    index: 'r-index',
    previous: 'r-previous',
    next: 'r-next'
}

const C = {
    loader: 'c-loader',
    container: 'c-loader-container'
}

interface PageContents {
    status?: {
        actual: {
            page: string;
            type: 'C' | 'R';
        };
    }
    pages: {
        Column: Array<{
            id: string;
            html: string;
            updateable: boolean;
            script?: string;
        }>;
        Row: Array<{
            id: string;
            html: string;
            index?: string | number | null;
            next?: string | null;
            previous: string | null;
            parent: HTMLElement | null;
            script?: string;
        }>;
        Indexbar?: Array<{
            index?: number;
            html?: string;
        }>;
    };
};

class PageLoader {
    protected content: PageContents;
    constructor() {
        this.content = {
            pages: {
                Column: [],
                Row: [],
                Indexbar: []
            }
        };
        // Row indexbar
        document.querySelectorAll(`[${R.index}]`)
            .forEach((elmnt, key) => {
                this.content.pages.Indexbar!.push({
                    index: Number(elmnt.getAttribute(R.index)),
                    html: elmnt.outerHTML
                });
                elmnt.remove();
            });
        // Row pages
        document.querySelectorAll(`[${R.loader}]`)
            .forEach((elmnt, key) => {
                this.content.pages!.Row!.push({
                    id: elmnt.id,
                    html: elmnt.innerHTML,
                    index: elmnt.getAttribute(R.loader),
                    next: elmnt.getAttribute(R.next),
                    previous: elmnt.getAttribute(R.previous),
                    parent: elmnt.parentElement
                });
                elmnt.remove();
            });
        // Column pages
        document.querySelectorAll(`[${C.loader}]`)
            .forEach((elmnt, key) => {
                this.content.pages!.Column!.push({
                    id: elmnt.id,
                    html: elmnt.innerHTML,
                    updateable: elmnt.hasAttribute('updateable')
                });
                elmnt.remove();
            });
    }

    load(id: string) {
        let Row = this.content.pages!.Row;
        let Column = this.content.pages!.Column;
       if (Row!.some(page => page.id === id)) {
            let rPage = Row!.filter((val) => {return val.id === id})[0];
            let cPage = Column!.filter((val) => {return val.id === rPage.parent!.id})[0];
            document.querySelector(`[${C.container}]`)!.innerHTML = cPage.html;
            document.querySelector(`[${R.container}]`)!.innerHTML = rPage.html;
            this.content.status = {
                actual: {
                    page: id,
                    type: 'R'
                }
            };
       } else if (Column!.some(page => page.id === id)) {
            let cPage = Column!.filter((val) => {return val.id === id})[0];
            document.querySelector(`[${C.container}]`)!.innerHTML = cPage.html;
            this.content.status = {
                actual: {
                    page: id,
                    type: 'C'
                }
            };
       } else throw new Error(`There is no page with this ID: ${id}`);
    }

    update() {
        let Column = this.content.pages!.Column;
        let id = this.content.status?.actual.page;
        switch(this.content.status?.actual.type) {
            case 'C':
                let cPage = Column.filter((val) => {return val.id === id})[0];
                if (cPage.updateable) document.querySelector(`[${C.container}]`)!.innerHTML = cPage.html;
                break;
        }
    }

}

export { MSSQL };
export { PageLoader };
