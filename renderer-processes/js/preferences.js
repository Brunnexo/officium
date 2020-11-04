// Dependências
window.jQuery = window.$ = require('jquery');
require('bootstrap');

const { ColorMode } = require('../../officium-modules/colormode');

$(document).ready(() => {
    console.log(localStorage.getItem('colorMode'));
    ColorMode(localStorage.getItem('colorMode'));
});