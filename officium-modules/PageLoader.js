"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageLoader = void 0;
const fs = require('fs');
const R = {
    loader: 'r-loader',
    container: 'r-loader-container',
    scriptLoader: 'r-loader-script',
    previous: 'r-previous',
    next: 'r-next'
};
const C = {
    loader: 'c-loader',
    scriptLoader: 'c-loader-script',
    container: 'c-loader-container'
};
class PageLoader {
    constructor() {
        this.content = {
            pages: {
                Column: [],
                Row: [],
                Indexbar: []
            }
        };
        document.querySelectorAll(`[${R.loader}]`)
            .forEach((elmnt, key) => {
            let path = `${__dirname}\\PageScripts\\${elmnt.id}.js`;
            this.content.pages.Row.push({
                id: elmnt.id,
                html: elmnt.innerHTML,
                updateable: elmnt.hasAttribute('updateable'),
                parent: elmnt.parentElement,
                script: fs.existsSync(path) ? fs.readFileSync(path, 'utf-8') : ''
            });
            elmnt.remove();
        });
        document.querySelectorAll(`[${C.loader}]`)
            .forEach((elmnt, key) => {
            let path = `${__dirname}\\PageScripts\\${elmnt.id}.js`;
            this.content.pages.Column.push({
                id: elmnt.id,
                html: elmnt.innerHTML,
                script: fs.existsSync(path) ? fs.readFileSync(path, 'utf-8') : '',
                updateable: elmnt.hasAttribute('updateable')
            });
            elmnt.remove();
        });
    }
    load(id, execute) {
        let Row = this.content.pages.Row;
        let Column = this.content.pages.Column;
        if (Row.some(page => page.id === id)) {
            let rPage = Row.filter((val) => { return val.id === id; })[0];
            let cPage = Column.filter((val) => { return val.id === rPage.parent.id; })[0];
            document.querySelector(`[${C.container}]`).innerHTML = cPage.html;
            document.querySelector(`[${R.container}]`).innerHTML = rPage.html;
            document.querySelector(`[${R.scriptLoader}]`).innerHTML = '';
            document.querySelector(`[${R.scriptLoader}]`).innerHTML = typeof (rPage.script) === 'string' ? rPage.script : '';
            this.content.status = {
                actual: {
                    page: id,
                    type: 'R'
                }
            };
            if (typeof (execute) === 'function')
                execute(rPage.id);
        }
        else if (Column.some(page => page.id === id)) {
            let cPage = Column.filter((val) => { return val.id === id; })[0];
            document.querySelector(`[${C.container}]`).innerHTML = cPage.html;
            document.querySelector(`[${C.scriptLoader}]`).innerHTML = '';
            document.querySelector(`[${C.scriptLoader}]`).innerHTML = typeof (cPage.script) === 'string' ? cPage.script : '';
            this.content.status = {
                actual: {
                    page: id,
                    type: 'C'
                }
            };
            if (typeof (execute) === 'function')
                execute(cPage.id);
        }
        else
            throw new Error(`There is no page with this ID: ${id}`);
    }
    update(execute) {
        let Column = this.content.pages.Column, Row = this.content.pages.Row, type = this.content.status.actual.type, id = this.content.status.actual.page;
        let page;
        if (type == 'C') {
            page = Column.filter((val) => { return val.id === id; })[0];
        }
        else {
            page = Row.filter((val) => { return val.id === id; })[0];
        }
        if (typeof (page) !== 'undefined' && page.updateable) {
            this.load(page.id, execute);
        }
    }
}
exports.PageLoader = PageLoader;
