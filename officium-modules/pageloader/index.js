const $ = require('jquery');

const CLOADER = '[c-loader]';
const CCONTAINER = '[c-loader-container]';

const RLOADER = '[r-loader]';
const RCONTAINER = '[r-loader-container]';

const RINDEXBAR = '[r-indexbar]';

// Índice atual
var r_index;

// Índice anterior
var r_index_previous;

// Página R selecionada
var r_selected;

module.exports.CLoader = class {
    constructor() {
        this.c_contents = new Object;
        this.r_contents = new Object;

        $(RLOADER).each((index, element) => {
            this.r_contents[
                $(RLOADER)[index].id
            ] = {
                html: $(`#${$(RLOADER)[index].id}`).html(),
                index: Number($(element).attr('r-loader'))
            }
            this.crid = $(`#${$(RLOADER)[index].id}`).closest(CLOADER)[0].id;
            console.log($(element).attr('r-loader'));
        });
        $(RLOADER).remove();

        $(CLOADER).each((index) => {
            this.c_contents[
                $(CLOADER)[index].id
            ] = {
                html: $(`#${$(CLOADER)[index].id}`).html()
            }
        });
        $(CLOADER).remove();
    };
    // Carrega o conteúdo coluna
    c_load(arg, execute) {
        // Carrega o conteúdo linha
        this.r_execute = function() {
            let html = this.r_contents[Object.keys(this.r_contents)[0]].html;
            r_index = this.r_contents[Object.keys(this.r_contents)[0]].index;
            r_index_previous = r_index;
            $(RCONTAINER).hide()
                .html(html)
                .fadeIn('slow');

            $(RINDEXBAR)
                .find('.pop')
                .each((index, element) => {
                    index != 0 ? $(element).hide() : null;
                });
        };

        $(CCONTAINER).hide()
            .html(this.c_contents[arg].html)
            .fadeIn('slow');

        if (this.crid == arg) {
            r_selected = true;
            this.r_execute();
        } else r_selected = false;

        if (typeof(execute) == 'function') execute();
    };

    // Carregar página linha
    r_load(arg, execute) {
        if (r_selected) {
            $(RCONTAINER).hide()
                .html(this.r_contents[arg].html)
                .fadeIn('slow');

            r_index_previous = r_index;
            r_index = this.r_contents[arg].index;

            $(RINDEXBAR)
                .find(`[index=${this.r_contents[arg].index}]`)
                .show();
            if (typeof(execute) == 'function') execute();
        } else throw new Error('R_page not loaded!');
    };
    // Ir para índice de página linha
    r_goto(index, execute) {
        if (r_selected) {
            switch (typeof(index)) {
                case 'number':
                    Object.keys(this.r_contents).forEach((val, i) => {
                        if (this.r_contents[val].index == index) {
                            $(RCONTAINER).hide()
                                .html(this.r_contents[val].html)
                                .fadeIn('slow');

                            r_index_previous = r_index;
                            r_index = this.r_contents[val].index;
                        }
                    });

                    $(RINDEXBAR)
                        .find('.pop')
                        .each((index, element) => {
                            index > r_index ? $(element).hide() : null;
                        });
                    break;
                case 'string':
                    break;
            }
            if (typeof(execute) == 'function') execute();
        } else throw new Error('R_page not loaded!');
    };

    // Próxima página linha
    r_next() {
        if (r_selected) {
            let ip, ia, f;
            Object.keys(this.r_contents).forEach((val, i) => {
                if (this.r_contents[val].index == (r_index + 1)) {
                    $(RCONTAINER).hide()
                        .html(this.r_contents[val].html)
                        .fadeIn('slow');
                    ip = r_index;
                    ia = this.r_contents[val].index;
                    f = true;
                }
            });
            if (f) {
                r_index_previous = ip;
                r_index = ia;
            }
        } else throw new Error('R_page not loaded!');
    };

    // Página linha anterior
    r_previous() {
        if (r_selected) {
            let ip, ia, f;
            Object.keys(this.r_contents).forEach((val, i) => {
                if (this.r_contents[val].index === r_index_previous) {
                    $(RCONTAINER).hide()
                        .html(this.r_contents[val].html)
                        .fadeIn('slow');
                    ip = r_index;
                    ia = this.r_contents[val].index;
                    f = true;
                    $(RINDEXBAR)
                        .find('.pop')
                        .each((index, element) => {
                            index != r_index ? $(element).hide() : null;
                        });
                }
            });
            if (f) {
                r_index_previous = ip;
                r_index = ia;
            }
        } else throw new Error('R_page not loaded!');
    };
}