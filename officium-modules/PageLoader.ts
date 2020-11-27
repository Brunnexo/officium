const fs = require('fs');

const R = {
    loader: 'r-loader',
    container: 'r-loader-container',
    scriptLoader: 'r-loader-script',
    indexbar: 'r-indexbar',
    index: 'r-index',
    previous: 'r-previous',
    next: 'r-next'
}

const C = {
    loader: 'c-loader',
    scriptLoader: 'c-loader-script',
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
}

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
                    html: elmnt.outerHTML,
                });
                elmnt.remove();
            });
        // Row pages
        document.querySelectorAll(`[${R.loader}]`)
            .forEach((elmnt, key) => {
                let path = `${__dirname}\\PageScripts\\${elmnt.id}.js`;
                this.content.pages!.Row!.push({
                    id: elmnt.id,
                    html: elmnt.innerHTML,
                    index: elmnt.getAttribute(R.loader),
                    next: elmnt.getAttribute(R.next),
                    previous: elmnt.getAttribute(R.previous),
                    parent: elmnt.parentElement,
                    script: fs.existsSync(path) ? fs.readFileSync(path, 'utf-8') : ''
                });
                elmnt.remove();
            });
        // Column pages
        document.querySelectorAll(`[${C.loader}]`)
            .forEach((elmnt, key) => {
                let path = `${__dirname}\\PageScripts\\${elmnt.id}.js`;
                this.content.pages!.Column!.push({
                    id: elmnt.id,
                    html: elmnt.innerHTML,
                    script: fs.existsSync(path) ? fs.readFileSync(path, 'utf-8') : '',
                    updateable: elmnt.hasAttribute('updateable')
                });
                elmnt.remove();
            });
    }

    load(id: string, execute?: Function | string) {
        let Row = this.content.pages!.Row;
        let Column = this.content.pages!.Column;
       if (Row!.some(page => page.id === id)) {
            let rPage = Row!.filter((val) => {return val.id === id})[0];
            let cPage = Column!.filter((val) => {return val.id === rPage.parent!.id})[0];
            document.querySelector(`[${C.container}]`)!.innerHTML = cPage.html;
            document.querySelector(`[${R.container}]`)!.innerHTML = rPage.html;
            document.querySelector(`[${R.scriptLoader}]`)!.innerHTML = '';
            document.querySelector(`[${R.scriptLoader}]`)!.innerHTML = typeof(rPage.script) === 'string' ? rPage.script : '';
            this.content.status = {
                actual: {
                    page: id,
                    type: 'R'
                }
            };

            document.querySelector(`[${R.indexbar}]`).innerHTML = this.content.pages.Indexbar[0].html;

            // this.content.pages.Indexbar.forEach((i) => {
            //     let indexHTML = document.querySelector(`[${R.indexbar}]`).innerHTML;
            //     document.querySelector(`[${R.indexbar}]`).innerHTML = indexHTML + i.html;
            // });

            if (typeof(execute) === 'function') execute();
            else if (typeof(execute) === 'string') {
                rPage.script = execute;
                eval(rPage.script);
            }
       } else if (Column!.some(page => page.id === id)) {
            let cPage = Column!.filter((val) => {return val.id === id})[0];
            document.querySelector(`[${C.container}]`)!.innerHTML = cPage.html;
            document.querySelector(`[${C.scriptLoader}]`)!.innerHTML = '';
            document.querySelector(`[${C.scriptLoader}]`)!.innerHTML = typeof(cPage.script) === 'string' ? cPage.script : '';
            this.content.status = {
                actual: {
                    page: id,
                    type: 'C'
                }
            };
            if (typeof(execute) === 'function') execute();
            else if (typeof(execute) === 'string') {
                cPage.script = execute;
                eval(cPage.script);
            }
       } else throw new Error(`There is no page with this ID: ${id}`);
    }

    update(execute?: Function | string) {
        let Column = this.content.pages!.Column;
        let id = this.content.status.actual.page;
        let page = Column!.filter((val) => {return val.id === id})[0];
       
        if (typeof(page) !== 'undefined' && page.updateable) {
            this.load(page.id, execute);
        }
    }
}

export { PageLoader };

