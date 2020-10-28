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
        this.executed = false;
    };

    execute() {
        if (!this.executed) {
            LOADER.remove();
            SCRIPT.remove();
            this.executed = true;
        } else {
            throw new Error('An instance is already running!');
        }
    };
    // Carrega o conteúdo
    load(arg, execute) {
        if (this.executed) {
            CONTAINER.hide().html(this.contents[arg].html).fadeIn('slow');
            eval(this.contents[arg].script);
            execute();
        } else {
            throw new Error(`Module not running! Use execute() to run!`);
        }
    };
}