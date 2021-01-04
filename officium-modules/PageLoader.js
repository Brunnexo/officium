"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageLoader = void 0;
const fs = require("fs");
const TRANSITION = 300;
const R = {
    loader: 'r-loader',
    container: 'r-loader-container',
    previous: 'r-previous',
};
const C = {
    loader: 'c-loader',
    container: 'c-loader-container',
    script: 'c-loader-script'
};
class PageLoader {
    constructor() {
        document.querySelector(`[${C.container}]`).style.transitionDuration = `${TRANSITION}ms`;
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
            let path = `${__dirname}/Scripts/${elmnt.id}.js`;
            this.content.pages.Row.push({
                id: elmnt.id,
                html: elmnt.innerHTML,
                updateable: elmnt.hasAttribute('updateable'),
                parent: elmnt.parentElement,
                onLoad: fs.existsSync(path) ? eval(fs.readFileSync(path, 'utf-8')) : undefined
            });
            elmnt.remove();
        });
        // Column pages
        document.querySelectorAll(`[${C.loader}]`)
            .forEach((elmnt, key) => {
            let path = `${__dirname}/Scripts/${elmnt.id}.js`;
            this.content.pages.Column.push({
                id: elmnt.id,
                html: elmnt.innerHTML,
                updateable: elmnt.hasAttribute('updateable'),
                onLoad: fs.existsSync(path) ? eval(fs.readFileSync(path, 'utf-8')) : undefined
            });
            elmnt.remove();
        });
    }
    loadScript(id, script) {
        let Row = this.content.pages.Row, Column = this.content.pages.Column;
        if (Row.some(page => page.id === id)) {
            let page = Row.filter((val) => { return val.id === id; })[0];
            page.onLoad = script;
        }
        else if (Column.some(page => page.id === id)) {
            let page = Column.filter((val) => { return val.id === id; })[0];
            page.onLoad = script;
        }
        else
            throw new Error(`Couldn't find page with ID: ${id}`);
    }
    load(id) {
        let Row = this.content.pages.Row;
        let Column = this.content.pages.Column;
        if (Row.some(page => page.id === id)) {
            let rPage = Row.filter((val) => { return val.id === id; })[0];
            let cPage = Column.filter((val) => { return val.id === rPage.parent.id; })[0];
            document.querySelector(`[${C.container}]`).style.opacity = '0';
            setTimeout(() => {
                document.querySelector(`[${C.container}]`).innerHTML = cPage.html;
                document.querySelector(`[${R.container}]`).innerHTML = rPage.html;
                document.querySelector(`[${C.container}]`).style.opacity = '1';
                if (typeof (rPage.onLoad) === 'function')
                    rPage.onLoad();
            }, TRANSITION);
            this.content.status = {
                actual: {
                    page: id,
                    type: 'R'
                }
            };
        }
        else if (Column.some(page => page.id === id)) {
            let cPage = Column.filter((val) => { return val.id === id; })[0];
            document.querySelector(`[${C.container}]`).style.opacity = '0';
            setTimeout(() => {
                document.querySelector(`[${C.container}]`).innerHTML = cPage.html;
                document.querySelector(`[${C.container}]`).style.opacity = '1';
                if (typeof (cPage.onLoad) === 'function')
                    cPage.onLoad();
            }, TRANSITION);
            this.content.status = {
                actual: {
                    page: id,
                    type: 'C'
                }
            };
        }
        else
            throw new Error(`There is no page with this ID: ${id}`);
    }
    update() {
        let Column = this.content.pages.Column, Row = this.content.pages.Row, type = this.content.status.actual.type, id = this.content.status.actual.page;
        let page;
        if (type == 'C')
            page = Column.filter((val) => { return val.id === id; })[0];
        else
            page = Row.filter((val) => { return val.id === id; })[0];
        if (typeof (page) !== 'undefined' && page.updateable)
            this.load(page.id);
    }
}
exports.PageLoader = PageLoader;
function pl(pageId) {
}
