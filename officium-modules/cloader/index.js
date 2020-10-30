const $ = require('jquery');

const LOADER = $('[c-loader]');
const CONTAINER = $('[c-loader-container]');
const NOUPDATE = 'no-update';

var executed = false;
var lastLoad;

module.exports.HTMLLoader = class {
    constructor() {
        this.contents = {};
        LOADER.each((index) => {
            this.contents[LOADER[index].id] = {
                html: $(`#${LOADER[index].id}`).html()
            }
            if (typeof(
                    $(`#${LOADER[index].id}`).attr(NOUPDATE)) !== 'undefined' &&
                typeof(
                    $(`#${LOADER[index].id}`).attr(NOUPDATE)) !== false) {
                this.contents[LOADER[index].id].NOUPDATE = false;
            } else this.contents[LOADER[index].id].NOUPDATE = true;
        });
    };
    // Executa o módulo
    execute() {
        if (!executed) {
            LOADER.remove();
            executed = true;
        } else {
            throw new Error('An instance is already running!');
        }
    };
    // Carrega o conteúdo
    load(arg, execute) {
        if (executed) {
            CONTAINER.hide()
                .html(this.contents[arg].html)
                .fadeIn('slow');
            lastLoad = arg;
            if (typeof(execute) == 'function') execute();
        } else {
            throw new Error(`Module not running! Use execute() to run!`);
        }
    };
    // Atualiza o conteúdo
    update(execute) {
        if (executed) {
            if (!this.contents[lastLoad].NOUPDATE) this.load(lastLoad, execute);
        } else {
            throw new Error(`Module not running! Use execute() to run!`);
        }
    };
    // Checa se é atualizável
    isUpdateable(arg) {
        return !this.contents[arg].NOUPDATE;
    };
}