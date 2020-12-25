const TRANSITION = 300;

const R = {
    loader: 'r-loader',
    container: 'r-loader-container',
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
            script?: Function;
        }>;
        Row: Array<{
            id: string;
            html: string;
            updateable: boolean;
            parent: HTMLElement | null;
            script?: Function;
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
        (document.querySelector(`[${C.container}]`)! as HTMLElement).style.transitionDuration = `${TRANSITION}ms`;

        this.content = {
            pages: {
                Column: [],
                Row: [],
                Indexbar: []
            }
        };
        // Row pages
        document.querySelectorAll(`[${R.loader}]`)
            .forEach((elmnt) => {
                this.content.pages!.Row!.push({
                    id: elmnt.id,
                    html: elmnt.innerHTML,
                    updateable: elmnt.hasAttribute('updateable'),
                    parent: elmnt.parentElement,
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

    loadScript(id: string, script: Function) {
        let Row = this.content.pages!.Row,
            Column = this.content.pages!.Column;
        if (Row!.some(page => page.id === id)) {
            let page = Row!.filter((val) => {return val.id === id})[0];
            page.script = script;
        } else if (Column!.some(page => page.id === id)) {
            let page = Column!.filter((val) => {return val.id === id})[0];
            page.script = script;
        } else throw new Error(`Couldn't find page with ID: ${id}`);
    }

    load(id: string) {
        let Row = this.content.pages!.Row;
        let Column = this.content.pages!.Column;
       if (Row!.some(page => page.id === id)) {
            let rPage = Row!.filter((val) => {return val.id === id})[0];
            let cPage = Column!.filter((val) => {return val.id === rPage.parent!.id})[0];
            (document.querySelector(`[${C.container}]`)! as HTMLElement).style.opacity = '0';
            setTimeout(() => {
                document.querySelector(`[${C.container}]`)!.innerHTML = cPage.html;
                document.querySelector(`[${R.container}]`)!.innerHTML = rPage.html;
                (document.querySelector(`[${C.container}]`)! as HTMLElement).style.opacity = '1';
                if (typeof(rPage.script) === 'function') rPage.script();
            }, TRANSITION);
            this.content.status = {
                actual: {
                    page: id,
                    type: 'R'
                }
            };
       } else if (Column!.some(page => page.id === id)) {
            let cPage = Column!.filter((val) => {return val.id === id})[0];
            (document.querySelector(`[${C.container}]`)! as HTMLElement).style.opacity = '0';
            setTimeout(() => {
                document.querySelector(`[${C.container}]`)!.innerHTML = cPage.html;
                (document.querySelector(`[${C.container}]`)! as HTMLElement).style.opacity = '1';
                if (typeof(cPage.script) === 'function') cPage.script();
            }, TRANSITION);
            this.content.status = {
                actual: {
                    page: id,
                    type: 'C'
                }
            };
       } else throw new Error(`There is no page with this ID: ${id}`);
    }

    update() {
        let Column = this.content.pages!.Column,
            Row = this.content.pages!.Row,
            type = this.content.status.actual.type,
            id = this.content.status.actual.page;

        let page;

        if (type == 'C') page = Column!.filter((val) => {return val.id === id})[0];
        else page = Row!.filter((val) => {return val.id === id})[0];
        
        if (typeof(page) !== 'undefined' && page.updateable) this.load(page.id);
    }
}

export { PageLoader };
