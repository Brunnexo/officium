"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageLoader = void 0;
const R = {
    loader: 'r-loader',
    container: 'r-loader-container',
    indexbar: 'r-indexbar',
    index: 'r-index',
    previous: 'r-previous',
    next: 'r-next'
};
const C = {
    loader: 'c-loader',
    container: 'c-loader-container'
};
;
class PageLoader {
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
            this.content.pages.Indexbar.push({
                index: Number(elmnt.getAttribute(R.index)),
                html: elmnt.outerHTML
            });
            elmnt.remove();
        });
        // Row pages
        document.querySelectorAll(`[${R.loader}]`)
            .forEach((elmnt, key) => {
            this.content.pages.Row.push({
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
            this.content.pages.Column.push({
                id: elmnt.id,
                html: elmnt.innerHTML,
                updateable: elmnt.hasAttribute('updateable')
            });
            elmnt.remove();
        });
    }
    load(id) {
        let Row = this.content.pages.Row;
        let Column = this.content.pages.Column;
        if (Row.some(page => page.id === id)) {
            let rPage = Row.filter((val) => { return val.id === id; })[0];
            let cPage = Column.filter((val) => { return val.id === rPage.parent.id; })[0];
            document.querySelector(`[${C.container}]`).innerHTML = cPage.html;
            document.querySelector(`[${R.container}]`).innerHTML = rPage.html;
            this.content.status = {
                actual: {
                    page: id,
                    type: 'R'
                }
            };
        }
        else if (Column.some(page => page.id === id)) {
            let cPage = Column.filter((val) => { return val.id === id; })[0];
            document.querySelector(`[${C.container}]`).innerHTML = cPage.html;
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
        var _a, _b;
        let Column = this.content.pages.Column;
        let id = (_a = this.content.status) === null || _a === void 0 ? void 0 : _a.actual.page;
        switch ((_b = this.content.status) === null || _b === void 0 ? void 0 : _b.actual.type) {
            case 'C':
                let cPage = Column.filter((val) => { return val.id === id; })[0];
                if (cPage.updateable)
                    document.querySelector(`[${C.container}]`).innerHTML = cPage.html;
                break;
        }
    }
}
exports.PageLoader = PageLoader;
