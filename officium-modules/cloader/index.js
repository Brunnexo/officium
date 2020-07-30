const $ = require('jquery');

const SCRIPT = $('[c-loader-script]');
const LOADER = $('[c-loader]');
const CONTAINER = $('[c-loader-container]');

module.exports.HTMLLoader = class {
    constructor() {
        this.contents = {};
        LOADER.each((index) => {
            this.contents[LOADER[index].id] = {
                html: $(`#${LOADER[index].id}`).html(),
                script: $(`[c-loader-script='${LOADER[index].id}']`).text()
            };
        });
        LOADER.remove();
        SCRIPT.remove();
    };
    // Carrega o conteúdo
    load(arg, execute) {
        CONTAINER.hide().html(this.contents[arg].html).fadeIn('slow');
        eval(this.contents[arg].script);
        if (typeof(execute) == "function") execute();
    };
    // Remove o conteúdo
    dispose() {
        CONTAINER.hide().html('');
    };
}